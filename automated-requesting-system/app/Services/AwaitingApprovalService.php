<?php
    namespace App\Services;

    class AwaitingApprovalService {
        public static function countForUser(int $userId, int $roleId): int {
            if ($roleId === 3) {
                $stmt = db()->prepare(
                    "SELECT COUNT(*) FROM forms
                     WHERE submitted_by = ?
                       AND status IN ('submitted', 'immediatehead_approved', 'process_approved', 'department_reviewed', 'finance_reviewed')"
                );
                $stmt->execute([$userId]);
                return (int) $stmt->fetchColumn();
            }

            [$sql, $params] = self::query('COUNT(*)', [$userId, $roleId]);
            $stmt = db()->prepare($sql);
            $stmt->execute($params);

            return (int) $stmt->fetchColumn();
        }

        public static function rowsForUser(int $userId, int $roleId): array {
            if ($roleId === 3) {
                                $stmt = db()->prepare(
                                    "SELECT 1 AS can_view, 0 AS can_process, f.id, f.form_type, f.status, f.submitted_by,
                                                        e.full_name, f.created_at
                                         FROM forms f
                                         JOIN employees e ON e.id = f.submitted_by
                                         WHERE f.submitted_by = ?
                                             AND f.status IN ('submitted', 'immediatehead_approved', 'process_approved', 'department_reviewed', 'finance_reviewed')
                                         ORDER BY f.created_at DESC"
                                );
                                $stmt->execute([$userId]);
                                return $stmt->fetchAll(\PDO::FETCH_ASSOC);
            }

            $viewability = 'CASE WHEN f.submitted_by = ? OR ? = 1
                    OR EXISTS (SELECT 1 FROM approvals mine WHERE mine.form_id = f.id AND mine.approver_id = ?)
                    OR EXISTS (
                        SELECT 1 FROM approvals a
                        JOIN employees approver ON approver.id = a.approver_id
                        WHERE a.form_id = f.id AND a.status = \'pending\'
                                                AND NOT EXISTS (
                                                        SELECT 1 FROM approvals a3
                                                        WHERE a3.form_id = a.form_id
                                                            AND a3.status = \'pending\'
                                                            AND a3.sequence < a.sequence
                                                            AND a3.approver_id <> a.approver_id
                                                )
                        AND (
                            (? = 4 AND a.sequence = 2)
                            OR (? = 5 AND (
                                approver.role_id = 5
                                OR (f.form_type = \'liquidation\'
                                    AND a.sequence = 3 AND approver.role_id = 9
                                    AND NOT EXISTS (
                                        SELECT 1 FROM approvals a5
                                        JOIN employees e5 ON e5.id = a5.approver_id
                                        WHERE a5.form_id = f.id AND a5.sequence = 3 AND e5.role_id = 5
                                    ))
                            ))
                            OR (? IN (6, 8, 9) AND approver.role_id = ?)
                            OR (? = 7 AND (
                                (f.form_type = \'vehicle_request\' AND a.sequence IN (2, 3, 4))
                                OR (f.form_type IN (\'leave_application\', \'overtime_authorization\') AND a.sequence = 4)
                            ))
                        )
                    )
                    OR (? IN (6, 9) AND f.form_type IN (\'leave_application\', \'overtime_authorization\')
                        AND LOWER(e.department) REGEXP \'(^|[^[:alnum:]])(management|human[[:space:]]+resources|hr|admin(istration)?)([^[:alnum:]]|$)\')
                    THEN 1 ELSE 0 END AS can_view';
            $standInAction = match ($roleId) {
                1 => '1 = 1',
                4 => 'a.sequence = 2',
                5 => '((approver.role_id = 5 AND (f.form_type <> \'reimbursement\' OR a.sequence = 4)) OR (f.form_type = \'liquidation\' AND approver.role_id = 9))',
                6, 8 => 'approver.role_id = ' . $roleId,
                9 => '(approver.role_id = 9 AND (f.form_type <> \'reimbursement\' OR a.sequence = 3))',
                7 => '((f.form_type = \'vehicle_request\' AND a.sequence IN (2, 4, 6)) OR (f.form_type IN (\'leave_application\', \'overtime_authorization\') AND a.sequence = 4))',
                default => '',
            };
            $canProcess = "CASE WHEN EXISTS (
                    SELECT 1 FROM approvals a
                    JOIN employees approver ON approver.id = a.approver_id
                    WHERE a.form_id = f.id AND a.status = 'pending'
                      AND (
                          (a.approver_id = ? AND (
                              f.form_type <> 'reimbursement'
                              OR (? = 5 AND a.sequence = 4 AND approver.role_id = 5)
                              OR (? = 9 AND a.sequence = 3 AND approver.role_id = 9)
                              OR ? NOT IN (5, 9)
                          ) AND NOT EXISTS (
                              SELECT 1 FROM approvals a3
                              WHERE a3.form_id = a.form_id AND a3.status = 'pending'
                                AND a3.sequence < a.sequence AND a3.approver_id <> a.approver_id
                          ))" . ($standInAction !== '' ? "
                          OR ({$standInAction} AND NOT EXISTS (
                              SELECT 1 FROM approvals a3
                              WHERE a3.form_id = a.form_id AND a3.status = 'pending'
                                AND a3.sequence < a.sequence
                          ))" : '') . "
                      )
                ) THEN 1 ELSE 0 END AS can_process";
            [$sql, $params] = self::query(
                $viewability . ', ' . $canProcess . ', f.id, f.form_type, f.status, f.submitted_by, e.full_name, f.created_at',
                [$userId, $roleId, $userId, $roleId, $roleId, $roleId, $roleId, $roleId, $roleId, $userId, $roleId, $roleId, $roleId, $userId, $roleId]
            );
            $stmt = db()->prepare($sql . ' ORDER BY f.created_at DESC');
            $stmt->execute($params);

            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        private static function query(string $select, array $params = []): array {
            $sql = "SELECT {$select}
                    FROM forms f
                    JOIN employees e ON e.id = f.submitted_by
                    WHERE f.status IN ('submitted', 'immediatehead_approved', 'process_approved', 'department_reviewed', 'finance_reviewed')
                      AND (
                          f.form_type NOT IN ('leave_application', 'overtime_authorization')
                          OR LOWER(e.department) NOT REGEXP '(^|[^[:alnum:]])(management|human[[:space:]]+resources|hr|admin(istration)?)([^[:alnum:]]|$)'
                          OR f.submitted_by = ?
                          OR ? IN (1, 6, 9)
                      )";
            return [$sql, $params];
        }
    }