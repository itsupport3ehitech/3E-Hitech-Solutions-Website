<?php
    namespace App\Services;

    class RejectedCountService {
        public static function forUser(int $userId, int $roleId): int {
            $sql = 'SELECT DISTINCT f.id, f.created_at
                    FROM forms f
                    JOIN employees e ON e.id = f.submitted_by
                    LEFT JOIN approvals a ON a.form_id = f.id
                    WHERE f.status = "rejected"
                      AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            $params = [];

            if ($roleId === 7) {
                $sql .= ' AND (f.submitted_by = ? OR a.approver_id = ?
                    OR (f.form_type = "vehicle_request" AND a.sequence IN (2, 3, 4))
                    OR (f.form_type IN ("leave_application", "overtime_authorization") AND a.sequence = 4))';
                $params = [$userId, $userId];
            } elseif ($roleId === 6 || $roleId === 8 || $roleId === 9) {
                $sql .= ' AND (a.approver_id = ? OR f.submitted_by = ?
                    OR a.approver_id IN (SELECT id FROM employees WHERE role_id = ?))';
                $params = [$userId, $userId, $roleId];
            } elseif ($roleId === 5) {
                $sql .= ' AND (a.approver_id = ? OR f.submitted_by = ?
                    OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 5))';
                $params = [$userId, $userId];
            } elseif (in_array($roleId, [2, 4], true)) {
                $sql .= ' AND (a.approver_id = ? OR f.submitted_by = ?)';
                $params = [$userId, $userId];
            } elseif ($roleId !== 1) {
                $sql .= ' AND f.submitted_by = ?';
                $params[] = $userId;
            }

            $sql .= ' ORDER BY f.created_at DESC';
            if ($roleId === 1) {
                $sql .= ' LIMIT 50';
            } elseif ($roleId === 3) {
                $sql .= ' LIMIT 30';
            }

            $stmt = db()->prepare("SELECT COUNT(*) FROM ({$sql}) rejected_forms");
            $stmt->execute($params);

            return (int) $stmt->fetchColumn();
        }
    }