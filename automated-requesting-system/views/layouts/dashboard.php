<?php
    define('BASE_LOADED', true);
    use App\Middleware\AuthMiddleware;
    AuthMiddleware::require();

    $roleId = (int) $_SESSION['role_id'];
    $userId = (int) $_SESSION['user_id'];

    // ── Recent activity query (last 30 days, role-scoped) ── //
    if ($roleId === 1) {
        $stmt = db()->prepare(
            'SELECT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            WHERE f.status NOT IN ("draft", "cancelled")
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC LIMIT 50'
        );
        $stmt->execute();
    } elseif ($roleId === 7) {
        // AdminApprover is never the literal approver_id on a row — they only
        // ever act through the fallback in FormController::processApproval().
        // So show forms at any sequence/form-type they cover, per
        // FormController::ADMIN_APPROVER_STANDIN_COVERAGE:
        //   - Vehicle Request: Checker/Dept Head/Final (2, 4, 6)
        //   - Leave Application / Overtime: Dept Head only (4)
        $stmt = db()->prepare(
            'SELECT DISTINCT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            LEFT JOIN approvals a ON a.form_id = f.id
            WHERE (
                f.submitted_by = ?
                OR a.approver_id = ?
                OR (f.form_type = "vehicle_request" AND a.sequence IN (2, 3, 4))
                OR (f.form_type IN ("leave_application", "overtime_authorization") AND a.sequence = 4)
            )
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
    } elseif ($roleId === 6) {
        // FinalApprover shared queue: see forms assigned to them PLUS any
        // pending Grant Approval row assigned to any other Final Approver.
        $stmt = db()->prepare(
            'SELECT DISTINCT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            JOIN approvals a ON a.form_id = f.id
            WHERE (
                a.approver_id = ?
                OR f.submitted_by = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 6)
            )
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
    } elseif ($roleId === 9) {
        // HRVerifier shared queue: see forms assigned to them PLUS any
        // pending Process Approval (HR Verification) row assigned to any
        // other HR Verifier.
        $stmt = db()->prepare(
            'SELECT DISTINCT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            JOIN approvals a ON a.form_id = f.id
            WHERE (
                a.approver_id = ?
                OR f.submitted_by = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 9)
            )
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
    } elseif ($roleId === 8) {
        // FinanceHead shared queue: see forms assigned to them PLUS any
        // pending Evaluation Approval row assigned to any other Finance Head.
        $stmt = db()->prepare(
            'SELECT DISTINCT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            JOIN approvals a ON a.form_id = f.id
            WHERE (
                a.approver_id = ?
                OR f.submitted_by = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 8)
            ) 
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
    } elseif ($roleId === 5) {
        // AcquisitionChecker/Accounting shared queue: see forms assigned to
        // them PLUS any pending Process (Accounting Checking) row assigned
        // to any other Accounting account.
        $stmt = db()->prepare(
            'SELECT DISTINCT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            JOIN approvals a ON a.form_id = f.id
            WHERE (
                a.approver_id = ?
                OR f.submitted_by = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 5)
            )
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
    } elseif (in_array($roleId, [ 2, 4 ], true)) {
        $stmt = db()->prepare(
            'SELECT DISTINCT f.id, f.submitted_by, f.form_type, f.status, e.full_name, f.created_at
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            JOIN approvals a ON a.form_id = f.id
            WHERE (a.approver_id = ? OR f.submitted_by = ?)
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
    } else {
        $stmt = db()->prepare(
            'SELECT f.id, f.submitted_by, f.form_type, f.status, f.created_at, e.full_name
            FROM forms f JOIN employees e ON e.id = f.submitted_by
            WHERE f.submitted_by = ?
            AND f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY f.created_at DESC LIMIT 30'
        );
        $stmt->execute([$userId]);
    }

    $forms = $stmt->fetchAll();
    $formLabel = \App\Helpers\FormLabels::all();
    $badgeMap = \App\Helpers\FormLabels::allBadges();

    ob_start();

    // ── Status ── //
    $statusLabels = [
        'draft' => 'Draft',
        'submitted' => 'Submitted',
        'immediatehead_approved' => 'With Immediate Head',
        'process_approved' => 'Processing',
        'department_reviewed' => 'Dept. Review', 
        'finance_reviewed' => 'Finance Review',
        'final_approved' => 'Final Approved',
        'completed' => 'Completed',
        'rejected' => 'Rejected',
        'cancelled' => 'Cancelled',
    ];

    // ── KPI bucket mapping ── //
    $inApprovalStatuses = [
        'submitted',
        'immediatehead_approved',
        'process_approved',
        'department_reviewed',
        'finance_reviewed',
    ];
    $approvedStatuses = ['final_approved', 'completed'];

    $counts = ['draft' => 0, 'in_approval' => 0, 'approved' => 0, 'rejected' => 0];
    $staffDraftRows = array_values(array_filter($forms, static function ($form) use ($userId): bool {
        return ((int)($form['submitted_by'] ?? 0) === $userId) && $form['status'] === 'draft';
    }));
    $staffDraftCount = count($staffDraftRows);
    $approvalCounts = ['approved' => 0, 'rejected' => 0];
    foreach ($forms as $f) {
        if (in_array($f['status'], $approvedStatuses, true)) {
            $approvalCounts['approved']++;
        } elseif ($f['status'] === 'rejected') {
            $approvalCounts['rejected']++;
        }

        if ((int)($f['submitted_by'] ?? 0) !== $userId) {
            continue;
        }

        $s = $f['status'];
        if ($s === 'draft') {
            $counts['draft']++;
        } elseif (in_array($s, $inApprovalStatuses, true)) {
            $counts['in_approval']++;
        } elseif (in_array($s, $approvedStatuses, true)) {
            $counts['approved']++;
        } elseif ($s === 'rejected') {
            $counts['rejected']++;
        }
    }
    $approvalCounts['rejected'] = \App\Services\RejectedCountService::forUser($userId, $roleId);

    $approvedRows = array_values(array_filter($forms, static function ($form): bool {
        return in_array($form['status'], ['final_approved', 'completed'], true);
    }));
    if ($roleId === 7) {
        $approvedRowsStmt = db()->prepare(
            "SELECT f.id, f.form_type, f.status, e.full_name, f.created_at
             FROM forms f
             JOIN employees e ON e.id = f.submitted_by
             WHERE f.status IN ('final_approved', 'completed')
             ORDER BY f.created_at DESC, f.id DESC"
        );
        $approvedRowsStmt->execute();
        $approvedRows = $approvedRowsStmt->fetchAll(PDO::FETCH_ASSOC);
        $approvalCounts['approved'] = count($approvedRows);
    }

    // ── Icon + fixed colour map (keyed by form_type) ── //
    $iconMap = [
        'advance_payment' => ['bg' => '#d1fae5', 'color' => '#10b981', 'icon' => 'ti-cash', 'barColor' => '#10b981'],
        'overtime_authorization' => ['bg' => '#ede9fe', 'color' => '#8b5cf6', 'icon' => 'ti-clock-hour-4', 'barColor' => '#8b5cf6'],
        'request_for_payment' => ['bg' => '#fce7f3', 'color' => '#ec4899', 'icon' => 'ti-receipt', 'barColor' => '#ec4899'],
        'leave_application' => ['bg' => '#dbeafe', 'color' => '#0ea5e9', 'icon' => 'ti-beach', 'barColor' => '#0ea5e9'],
        'reimbursement' => ['bg' => '#ffedd5', 'color' => '#f97316', 'icon' => 'ti-credit-card-refund', 'barColor' => '#f97316'],
        'liquidation' => ['bg' => '#e0f2fe', 'color' => '#0284c7', 'icon' => 'ti-calculator', 'barColor' => '#0284c7'],
        'vehicle_request' => ['bg' => '#fef9c3', 'color' => '#ca8a04', 'icon' => 'ti-car', 'barColor' => '#ca8a04'],
    ];

    // ── Form volume ── //
    $typeCounts   = [];
    foreach ($forms as $f) {
        $typeCounts[$f['form_type']] = ($typeCounts[$f['form_type']] ?? 0) + 1;
    }
    $maxTypeCount = max(array_values($typeCounts) ?: [1]);
    arsort($typeCounts);

    $quickForms = [
        ['slug' => 'advance-payment', 'label' => 'Advance', 'desc' => 'Cash advance', 'color' => '#10b981', 'icon' => 'ti-cash'],
        ['slug' => 'overtime-authorization', 'label' => 'Overtime', 'desc' => 'OT authorization', 'color' => '#8b5cf6', 'icon' => 'ti-clock-hour-4'],
        ['slug' => 'request-for-payment', 'label' => 'Payment', 'desc' => 'Request payment',  'color' => '#ec4899', 'icon' => 'ti-receipt'],
        ['slug' => 'leave-application', 'label' => 'Leave', 'desc' => 'File absence', 'color' => '#0ea5e9', 'icon' => 'ti-beach'],
        ['slug' => 'reimbursement', 'label' => 'Reimburse', 'desc' => 'Claim expenses', 'color' => '#f97316', 'icon' => 'ti-credit-card-refund'],
        ['slug' => 'liquidation', 'label' => 'Liquidation', 'desc' => 'Clear advance', 'color' => '#0284c7', 'icon' => 'ti-calculator'],
        ['slug' => 'vehicle-request', 'label' => 'Vehicle', 'desc' => 'Reserve vehicle', 'color' => '#ca8a04', 'icon' => 'ti-car'],
    ];

    // ── Pending alert ── //
    $dashPending = 0;
    $dashOverdue = 0;
    $kpiFilter = $_GET['kpi'] ?? 'completed'; 
    $kpiRows = [];
    $postApprovalRows = \App\Services\PostApprovalService::rowsForUser($userId, $roleId);
    $postApprovalCount = count($postApprovalRows);
    $completedRowsSql = "SELECT f.id, f.form_type, f.status, e.full_name, f.created_at
                         FROM forms f
                         JOIN employees e ON e.id = f.submitted_by
                         WHERE f.status = 'completed'
                           AND (
                               f.form_type IN ('leave_application', 'overtime_authorization')
                               OR (
                                   COALESCE(JSON_UNQUOTE(JSON_EXTRACT(f.data, '$.payment_proof_path')), '') <> ''
                                   AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(f.data, '$.liquidation_proof_path')), '') <> ''
                               )
                           )
                           AND (? IN (1, 6, 7) OR EXISTS (
                               SELECT 1 FROM approvals a
                               WHERE a.form_id = f.id AND a.approver_id = ?
                           ))";
    $completedRowsParams = [$roleId, $userId];
    $completedRowsSql .= ' ORDER BY f.created_at DESC, f.id DESC';
    $completedRowsStmt = db()->prepare($completedRowsSql);
    $completedRowsStmt->execute($completedRowsParams);
        $completedRows = $completedRowsStmt->fetchAll(PDO::FETCH_ASSOC);
        $completedCount = count($completedRows);
    $awaitingApprovalCount = \App\Services\AwaitingApprovalService::countForUser($userId, $roleId);
        if ($roleId === 3) {
            $dashPending = \App\Services\PendingCountService::forUser($userId, $roleId);
        } elseif (in_array($roleId, [ 1, 2, 4, 5, 6, 7, 8, 9 ], true)) {
        $cacheKey = "pending_count_{$userId}";
        $dashPending = \App\Services\PendingCountService::forUser($userId, $roleId);
        $_SESSION[$cacheKey] = $dashPending;
        $_SESSION["pending_count_ts_{$userId}"] = time();

        $overdueSql = 'SELECT COUNT(*) FROM approvals a
                       JOIN forms f ON f.id = a.form_id
                       WHERE a.status = "pending"
                       AND DATEDIFF(NOW(), f.created_at) >= 3
                       AND NOT EXISTS (
                           SELECT 1 FROM approvals a3
                           WHERE a3.form_id = a.form_id
                           AND a3.status = "pending"
                           AND a3.sequence < a.sequence
                       )';
        $overdueParams = [];
        if ($roleId === 1) {
            $overdueSql .= ' AND f.status NOT IN ("draft", "cancelled", "completed", "rejected")';
        } elseif ($roleId === 7) {
            $overdueSql .= ' AND (a.approver_id = ?
                OR (f.form_type = "vehicle_request" AND a.sequence IN (1, 2, 3, 4))
                OR (f.form_type IN ("leave_application", "overtime_authorization") AND a.sequence = 4))
                AND (f.status NOT IN ("draft", "completed", "rejected", "cancelled")
                OR (f.form_type = "vehicle_request" AND a.sequence = 1 AND f.status = "draft"))';
            $overdueParams[] = $userId;
        } elseif ($roleId === 5) {
            $overdueSql .= ' AND (
                a.approver_id = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 5)
                OR (
                    f.form_type = "liquidation"
                    AND a.sequence = 3
                    AND a.approver_id IN (SELECT id FROM employees WHERE role_id = 9)
                    AND NOT EXISTS (
                        SELECT 1 FROM approvals a5
                        JOIN employees e5 ON e5.id = a5.approver_id
                        WHERE a5.form_id = f.id AND a5.sequence = 3 AND e5.role_id = 5
                    )
                )
            ) AND (
                f.form_type <> "reimbursement"
                OR (a.sequence = 4 AND a.approver_id IN (SELECT id FROM employees WHERE role_id = 5))
            ) AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $overdueParams = [$userId];
        } elseif (in_array($roleId, [ 6, 8, 9 ], true)) {
            $overdueSql .= ' AND (a.approver_id = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = ?))
                AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $overdueParams = [$userId, $roleId];
        } elseif ($roleId === 4) {
            $overdueSql .= ' AND (a.approver_id = ? OR a.sequence = 2)
                AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $overdueParams[] = $userId;
        } elseif ($roleId === 2) {
            $overdueSql .= ' AND a.approver_id = ?
                AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $overdueParams[] = $userId;
        }
        $overdueStmt = db()->prepare($overdueSql);
        $overdueStmt->execute($overdueParams);
        $dashOverdue = (int) $overdueStmt->fetchColumn();
    }

    if ($kpiFilter === 'awaiting') {
        $kpiRows = \App\Services\AwaitingApprovalService::rowsForUser($userId, $roleId);
    } elseif ($kpiFilter === 'post_approval') {
        $kpiRows = $postApprovalRows;
    } elseif ($kpiFilter === 'drafts' && $roleId === 3) {
        $kpiRows = $staffDraftRows;
    } elseif ($kpiFilter === 'pending' && $roleId === 3) {
        $kpiRows = \App\Services\PostApprovalService::actionableRowsForUser($userId, $roleId);
    } elseif ($kpiFilter === 'completed') {
        $kpiRows = $completedRows;
    } elseif ($kpiFilter === 'approved' || $kpiFilter === 'rejected') {
        $kpiRows = $kpiFilter === 'approved'
            ? $approvedRows
            : array_values(array_filter($forms, static fn($form): bool => $form['status'] === 'rejected'));
    } elseif ($kpiFilter === 'pending' || $kpiFilter === 'overdue') {
        $approvalRowsSql = 'SELECT DISTINCT f.id, f.form_type, f.status, e.full_name, e.department, f.created_at,
                       a.sequence,
                                   DATEDIFF(NOW(), f.created_at) AS days_pending
                            FROM approvals a
                            JOIN forms f ON f.id = a.form_id
                            JOIN employees e ON e.id = f.submitted_by
                            WHERE a.status = "pending"
                            AND NOT EXISTS (
                                SELECT 1 FROM approvals a3
                                WHERE a3.form_id = a.form_id
                                AND a3.status = "pending"
                                AND a3.sequence < a.sequence
                            )';
        $approvalRowsParams = [];
        if ($roleId === 1) {
            $approvalRowsSql .= ' AND f.status NOT IN ("draft", "cancelled", "completed", "rejected")';
        } elseif ($roleId === 7) {
            $approvalRowsSql .= ' AND (a.approver_id = ?
                OR (f.form_type = "vehicle_request" AND a.sequence IN (1, 2, 3, 4))
                OR (f.form_type IN ("leave_application", "overtime_authorization") AND a.sequence = 4))
                AND (f.status NOT IN ("draft", "completed", "rejected", "cancelled")
                OR (f.form_type = "vehicle_request" AND a.sequence = 1 AND f.status = "draft"))';
            $approvalRowsParams[] = $userId;
        } elseif ($roleId === 5) {
            $approvalRowsSql .= ' AND (
                a.approver_id = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = 5)
                OR (
                    f.form_type = "liquidation"
                    AND a.sequence = 3
                    AND a.approver_id IN (SELECT id FROM employees WHERE role_id = 9)
                    AND NOT EXISTS (
                        SELECT 1 FROM approvals a5
                        JOIN employees e5 ON e5.id = a5.approver_id
                        WHERE a5.form_id = f.id AND a5.sequence = 3 AND e5.role_id = 5
                    )
                )
            ) AND (
                f.form_type <> "reimbursement"
                OR (a.sequence = 4 AND a.approver_id IN (SELECT id FROM employees WHERE role_id = 5))
            ) AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $approvalRowsParams = [$userId];
        } elseif (in_array($roleId, [ 6, 8, 9 ], true)) {
            $approvalRowsSql .= ' AND (a.approver_id = ?
                OR a.approver_id IN (SELECT id FROM employees WHERE role_id = ?))
                AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")'; 
            $approvalRowsParams = [$userId, $roleId];
        } elseif ($roleId === 4) { 
            $approvalRowsSql .= ' AND (a.approver_id = ? OR a.sequence = 2)
                AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $approvalRowsParams[] = $userId;
        } elseif ($roleId === 2) {
            $approvalRowsSql .= ' AND a.approver_id = ?
                AND f.status NOT IN ("draft", "completed", "rejected", "cancelled")';
            $approvalRowsParams[] = $userId;
        }
        if ($kpiFilter === 'overdue') {
            $approvalRowsSql .= ' AND DATEDIFF(NOW(), f.created_at) >= 3';
        }
        $approvalRowsSql .= ' ORDER BY f.created_at DESC, f.id DESC';
        $approvalRowsStmt = db()->prepare($approvalRowsSql);
        $approvalRowsStmt->execute($approvalRowsParams);
        $kpiRows = $approvalRowsStmt->fetchAll();
        if ($kpiFilter === 'pending') {
            foreach (\App\Services\PostApprovalService::actionableRowsForUser($userId, $roleId) as $postApprovalRow) {
                $kpiRows[] = $postApprovalRow;
            }
        }
    } elseif ($kpiFilter === 'history') {
        $historyRowsSql = 'SELECT f.id, f.form_type, f.created_at, f.submitted_by,
                                  e.full_name, e.department,
                                  a.sequence, a.status AS action_status, a.assigned_at, a.approved_at,
                                  ea.full_name AS actor_name,
                                  TIMESTAMPDIFF(SECOND, a.assigned_at, a.approved_at) AS waiting_seconds
                           FROM approvals a
                           JOIN forms f ON f.id = a.form_id
                           JOIN employees e ON e.id = f.submitted_by
                           JOIN employees ea ON ea.id = a.approver_id
                           WHERE a.status IN ("approved", "rejected")';
        $historyRowsParams = [];
        if ($roleId === 3) {
            $historyRowsSql .= ' AND f.submitted_by = ?';
            $historyRowsParams[] = $userId;
        }
        $historyRowsSql .= ' ORDER BY a.approved_at DESC, a.id DESC';
        $historyRowsStmt = db()->prepare($historyRowsSql);
        $historyRowsStmt->execute($historyRowsParams);
        $kpiRows = $historyRowsStmt->fetchAll();
    }

    if (!empty($kpiRows)) {
        $kpiFormIds = array_values(array_unique(array_map('intval', array_column($kpiRows, 'id'))));
        if ($kpiFormIds !== []) {
            $checkVoucherPlaceholders = implode(', ', array_fill(0, count($kpiFormIds), '?'));
            $checkVoucherStmt = db()->prepare(
                "SELECT id, COALESCE(check_voucher, JSON_UNQUOTE(JSON_EXTRACT(data, '$.check_voucher')), '') AS check_voucher
                 FROM forms WHERE id IN ({$checkVoucherPlaceholders})"
            );
            $checkVoucherStmt->execute($kpiFormIds);
            $checkVoucherByFormId = array_column($checkVoucherStmt->fetchAll(PDO::FETCH_ASSOC), 'check_voucher', 'id');
            foreach ($kpiRows as &$kpiRow) {
                $kpiRow['check_voucher'] = $checkVoucherByFormId[$kpiRow['id']] ?? '';
            }
            unset($kpiRow);
        }
    }

    $kpiSearchQuery = isset($_GET['search']) && is_string($_GET['search'])
        ? trim($_GET['search'])
        : '';
    if ($kpiSearchQuery !== '') {
        $kpiRows = array_values(array_filter($kpiRows, static function (array $row) use ($kpiSearchQuery, $kpiFilter): bool {
            $dateValue = $row[$kpiFilter === 'history' ? 'approved_at' : 'created_at'] ?? '';
            $searchableValues = [
                (string) ($row['check_voucher'] ?? ''),
                (string) ($row['full_name'] ?? ''),
                (string) $dateValue,
            ];
            if ($dateValue !== '' && strtotime((string) $dateValue) !== false) {
                $searchableValues[] = date('M d, Y', strtotime((string) $dateValue));
                $searchableValues[] = date('Y-m-d', strtotime((string) $dateValue));
            }

            foreach ($searchableValues as $value) {
                if (stripos($value, $kpiSearchQuery) !== false) {
                    return true;
                }
            }

            return false;
        }));
    }

    $kpiTotalRows = count($kpiRows);
    $kpiDateField = $kpiFilter === 'history' ? 'approved_at' : 'created_at';
    usort($kpiRows, static function (array $left, array $right) use ($kpiDateField): int {
        $dateOrder = (strtotime($right[$kpiDateField] ?? '') ?: 0) <=> (strtotime($left[$kpiDateField] ?? '') ?: 0);
        return $dateOrder !== 0 ? $dateOrder : ((int)($right['id'] ?? 0) <=> (int)($left['id'] ?? 0));
    });
    $kpiPageSize = 10;
    $kpiTotalPages = max(1, (int)ceil($kpiTotalRows / $kpiPageSize));
    $kpiPage = filter_var($_GET['page'] ?? 1, FILTER_VALIDATE_INT);
    $kpiPage = $kpiPage === false || $kpiPage < 1 ? 1 : min($kpiPage, $kpiTotalPages);
    $kpiRows = array_slice($kpiRows, ($kpiPage - 1) * $kpiPageSize, $kpiPageSize);
?>

<!-- ── Page heading ── -->
<div class="page-heading">Welcome back, <?= htmlspecialchars(explode(' ', $_SESSION['user_name'])[0]) ?> 👋</div>
<!-- <div class="page-subheading"><?= date('l, F j, Y') ?></div> -->



<?php if ($roleId !== 3): ?>
<div class="sort-toggle dashboard-kpi-toggle">
    <a href="<?= url('dashboard?kpi=completed') ?>" class="sort-btn <?= $kpiFilter === 'completed' ? 'active' : '' ?>">
        <i class="ti ti-circle-check"></i> Completed
        <span class="sort-count"><?= $completedCount ?></span>
    </a>
    <a href="<?= url('dashboard?kpi=approved') ?>" class="sort-btn <?= $kpiFilter === 'approved' ? 'active' : '' ?>">
        <i class="ti ti-circle-check"></i> Approved
        <span class="sort-count"><?= (int) $approvalCounts['approved'] ?></span>
    </a>
    <a href="<?= url('dashboard?kpi=rejected') ?>" class="sort-btn <?= $kpiFilter === 'rejected' ? 'active' : '' ?>">
        <i class="ti ti-circle-x"></i> Rejected
        <span class="sort-count" id="dashboardRejectedKpi"><?= (int) $approvalCounts['rejected'] ?></span>
    </a>
    <a href="<?= url('dashboard?kpi=history') ?>" class="sort-btn <?= $kpiFilter === 'history' ? 'active' : '' ?>">
        <i class="ti ti-history"></i> History
    </a> 
</div>
<?php else: ?>
<div class="sort-toggle dashboard-kpi-toggle">
    <a href="<?= url('dashboard?kpi=completed') ?>" class="sort-btn <?= $kpiFilter === 'completed' ? 'active' : '' ?>">
        <i class="ti ti-circle-check"></i> Completed
        <span class="sort-count"><?= count($completedRows) ?></span>
    </a>
    <a href="<?= url('dashboard?kpi=approved') ?>" class="sort-btn <?= $kpiFilter === 'approved' ? 'active' : '' ?>">
        <i class="ti ti-circle-check"></i> Approved
        <span class="sort-count"><?= (int) $approvalCounts['approved'] ?></span>
    </a>
    <a href="<?= url('dashboard?kpi=rejected') ?>" class="sort-btn <?= $kpiFilter === 'rejected' ? 'active' : '' ?>">
        <i class="ti ti-circle-x"></i> Rejected
        <span class="sort-count" id="dashboardRejectedKpi"><?= (int) $approvalCounts['rejected'] ?></span>
    </a>
    <a href="<?= url('dashboard?kpi=history') ?>" class="sort-btn <?= $kpiFilter === 'history' ? 'active' : '' ?>">
        <i class="ti ti-history"></i> History
    </a> 
</div>
<?php endif; ?>

<!-- ── KPI Cards (last 30 days) ── --> 

<div class="kpi-grid">
    <?php if ($roleId !== 3): ?>
    <a href="<?= url('dashboard?kpi=pending') ?>" class="kpi-card blue kpi-card--link">
        <div class="kpi-icon blue"><i class="ti ti-inbox"></i></div>
        <div class="kpi-label">Pending</div>
        <div class="kpi-value" id="dashboardPendingKpi"><?= $dashPending ?></div>
        <div class="kpi-delta">Forms waiting for your action</div> 
    </a>
    <a href="<?= url('dashboard?kpi=overdue') ?>" class="kpi-card amber kpi-card--link">
        <div class="kpi-icon amber"><i class="ti ti-alert-triangle"></i></div>
        <div class="kpi-label">Overdue (3+ days)</div>
        <div class="kpi-value"><?= $dashOverdue ?></div>
        <div class="kpi-delta">Immediate decision required</div>
    </a>
    <?php endif; ?>
    <?php if ($roleId === 3): ?>
    <a href="<?= url('dashboard?kpi=pending') ?>" class="kpi-card blue kpi-card--link">
        <div class="kpi-icon blue"><i class="ti ti-inbox"></i></div>
        <div class="kpi-label">Pending</div>
        <div class="kpi-value" id="dashboardPendingKpi"><?= $dashPending ?></div>
        <div class="kpi-delta">Post approval actions you need to complete</div>
    </a>
    <?php endif; ?>
    <a href="<?= url('dashboard?kpi=awaiting') ?>" class="kpi-card green kpi-card--link">
        <div class="kpi-icon green"><i class="ti ti-hourglass"></i></div>
        <div class="kpi-label">Awaiting Approval</div>
        <div class="kpi-value" id="dashboardAwaitingApprovalKpi"><?= $awaitingApprovalCount ?></div>
        <div class="kpi-delta kpi-delta--period">Forms waiting for a decision from the relevant authority.</div>
    </a>
    <a href="<?= url('dashboard?kpi=post_approval') ?>" class="kpi-card purple kpi-card--link">
        <div class="kpi-icon purple"><i class="ti ti-file-invoice"></i></div>
        <div class="kpi-label">Post Approval</div>
        <div class="kpi-value" id="dashboardPostApprovalKpi"><?= $postApprovalCount ?></div>
        <div class="kpi-delta kpi-delta--period">Pending disbursement and liquidation</div>
    </a>
    <?php if ($roleId === 3): ?>
    <a href="<?= url('dashboard?kpi=drafts') ?>" class="kpi-card amber kpi-card--link">
        <div class="kpi-icon amber"><i class="ti ti-file-pencil"></i></div>
        <div class="kpi-label">Drafts</div>
        <div class="kpi-value" id="dashboardDraftKpi"><?= $staffDraftCount ?></div>
        <div class="kpi-delta kpi-delta--period">Forms saved but not yet submitted</div>
    </a>
    <?php endif; ?>
</div>

<?php
    $kpiPanelTitle = 'Approval History';
    if ($kpiFilter === 'drafts') {
        $kpiPanelTitle = 'Draft Forms';
    } elseif ($kpiFilter === 'awaiting') {
        $kpiPanelTitle = 'Awaiting Approval Requests';
    } elseif ($kpiFilter === 'post_approval' || ($kpiFilter === 'pending' && $roleId === 3)) {
        $kpiPanelTitle = 'Post Approval Actions';
    } elseif ($kpiFilter === 'completed') {
        $kpiPanelTitle = 'Completed Requests';
    } elseif ($kpiFilter === 'pending') {
        $kpiPanelTitle = 'Pending Approvals';
    } elseif ($kpiFilter === 'overdue') {
        $kpiPanelTitle = 'Overdue Approvals'; 
    } elseif ($kpiFilter === 'approved') {
        $kpiPanelTitle = 'Approved Requests'; 
    } elseif ($kpiFilter === 'rejected') {
        $kpiPanelTitle = 'Rejected Requests'; 
    }
?>
<?php if (($roleId !== 3 || in_array($kpiFilter, ['history', 'awaiting', 'post_approval', 'drafts', 'completed', 'approved', 'rejected', 'pending'], true)) && $kpiFilter !== '' && (!empty($kpiRows) || $kpiSearchQuery !== '')): ?>
<div class="table-wrap dashboard-kpi-table">
    <div class="filter-bar">
        <span class="card-panel-title"><?= htmlspecialchars($kpiPanelTitle) ?></span>
        <span class="badge badge-warning"><?= $kpiTotalRows ?> record<?= $kpiTotalRows === 1 ? '' : 's' ?></span>
        <form class="dashboard-kpi-search-form" action="<?= url('dashboard') ?>" method="get">
            <input type="hidden" name="kpi" value="<?= htmlspecialchars($kpiFilter) ?>">
            <input
                type="search"
                name="search"
                value="<?= htmlspecialchars($kpiSearchQuery) ?>"
                placeholder="<?= $kpiFilter === 'history' ? 'Search by submitted by or date…' : 'Search by CV no., submitted by, or date…' ?>"
                aria-label="Search records by CV number, submitter, or date"
                data-dashboard-kpi-search
            >
        </form>
    </div>
    <table>
        <thead>
            <tr>
                <th class="th-first">Form</th>
                <?php if ($kpiFilter === 'history'): ?>
                    <th>Stage</th>
                    <th>Result</th>
                    <th>Submitted By</th>
                    <th>Department</th>
                    <th>Actor</th>
                    <th>Action Date</th>
                    <th>Waiting Time</th>
                <?php else: ?>
                <th>CV No.</th>
                <th>Submitted By</th>
                <th><?= $kpiFilter === 'post_approval' ? 'Pending Action' : 'Status' ?></th>
                <th>Date</th>
                <?php endif; ?>
                <th class="td-last"></th> 
            </tr> 
        </thead> 
        <tbody>
        <?php foreach ($kpiRows as $row):
            if (!empty($row['post_approval_action'])) {
                $rowStatus = $row['post_approval_action'];
            } elseif ($kpiFilter === 'pending' || $kpiFilter === 'overdue') {
                $rowStatus = 'Pending';
            } elseif ($kpiFilter === 'history') {
                $rowStatus = ucfirst($row['action_status']);
            } else {
                $rowStatus = $statusLabels[$row['status']] ?? ucwords(str_replace('_', ' ', $row['status']));
            }
            $isSupervisorFlowFinalApproval = (int) ($row['sequence'] ?? 0) === 3
                && in_array($row['form_type'], ['leave_application', 'overtime_authorization'], true)
                && preg_match('/\b(accounting|information\s+technology|it|finance|logistics)\b|(?<![a-z-])sales\b|\bpre-sales\s*\(engineer\)|\bpost-sales\s*\(engineer\)/i', (string) ($row['department'] ?? '')) === 1;
            $canViewHistoryRow = $kpiFilter === 'history'
                && ((int)$row['submitted_by'] === $userId
                    || $roleId === 2
                    || in_array($roleId, [ 4, 5, 6, 8, 9 ], true));
            $waitingSeconds = max(0, (int)($row['waiting_seconds'] ?? 0));
            $waitingDays = intdiv($waitingSeconds, 86400);
            $waitingHours = intdiv($waitingSeconds % 86400, 3600);
            $waitingMinutes = intdiv($waitingSeconds % 3600, 60);
            $waitingTime = $waitingDays > 0
                ? $waitingDays . 'd ' . $waitingHours . 'h'
                : ($waitingHours > 0 ? $waitingHours . 'h ' . $waitingMinutes . 'm' : max(1, $waitingMinutes) . 'm');
        ?>
            <tr>
                <td class="td-first"><?= htmlspecialchars($formLabel[$row['form_type']] ?? $row['form_type']) ?></td>
                <?php if ($kpiFilter === 'history'): ?>
                    <td><span class="badge badge-primary"><?= htmlspecialchars(\App\Helpers\FormLabels::stepLabel((int)$row['sequence'], $row['form_type'])) ?></span></td>
                    <td><span class="badge badge-<?= $row['action_status'] === 'approved' ? 'success' : 'danger' ?>"><?= htmlspecialchars(ucfirst($row['action_status'])) ?></span></td>
                    <td><?= htmlspecialchars($row['full_name']) ?></td>
                    <td class="muted"><?= htmlspecialchars($row['department'] ?? '—') ?></td>
                    <td class="muted"><?= htmlspecialchars($row['actor_name']) ?></td>
                    <td class="muted"><?= $row['approved_at'] ? date('M d, Y H:i', strtotime($row['approved_at'])) : '—' ?></td>
                    <td class="muted"><?= htmlspecialchars($waitingTime) ?></td>
                <?php else: ?>
                <td><?= trim((string)($row['check_voucher'] ?? '')) !== '' ? htmlspecialchars((string)$row['check_voucher']) : '—' ?></td>
                <td><?= htmlspecialchars($row['full_name']) ?></td>
                <td><span class="badge badge-<?= $kpiFilter === 'rejected' || ($kpiFilter === 'history' && $row['action_status'] === 'rejected') ? 'danger' : ($kpiFilter === 'completed' || $kpiFilter === 'approved' || ($kpiFilter === 'history' && $row['action_status'] === 'approved') ? 'success' : 'warning') ?>"><?= htmlspecialchars($rowStatus) ?></span></td>
                <td class="muted"><?= date('M d, Y', strtotime($kpiFilter === 'history' && $row['approved_at'] ? $row['approved_at'] : $row['created_at'])) ?></td>
                <?php endif; ?>
                <td class="td-last text-end">
                    <div class="table-actions-inline">
                        <?php if ($kpiFilter === 'drafts' && $roleId === 3): ?>
                            <form method="POST" action="<?= url('forms/' . $row['id'] . '/delete') ?>" id="deleteDraftForm-<?= $row['id'] ?>" class="form-inline-btn">
                                <?= \App\Helpers\Csrf::field() ?>
                                <button
                                    type="button"
                                    class="btn btn-danger btn-sm"
                                    data-modal="deleteModal"
                                    data-target-form="deleteDraftForm-<?= $row['id'] ?>"
                                    data-form-title="<?= htmlspecialchars(($formLabel[$row['form_type']] ?? $row['form_type']) . ' Draft #' . $row['id']) ?>"
                                    title="Delete draft"
                                > 
                                    <i class="ti ti-trash"></i> 
                                </button>
                            </form>
                            <a href="<?= url('forms/' . $row['id'] . '/edit') ?>" class="btn btn-ghost btn-sm">View <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php elseif ($kpiFilter === 'pending' && $roleId === 3): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-primary btn-sm">Process <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php elseif ($kpiFilter === 'pending' && !empty($row['post_approval_action'])): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-primary btn-sm">Process <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php elseif ($kpiFilter === 'pending' && $roleId === 6): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-primary btn-sm">Process <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php elseif ($kpiFilter === 'pending' || $kpiFilter === 'overdue'): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-primary btn-sm">
                                <?= \App\Helpers\FormLabels::verb($isSupervisorFlowFinalApproval ? 4 : (int)$row['sequence'], $row['form_type']) ?> <i class="ti ti-arrow-right ti-xs"></i>
                            </a>
                        <?php elseif ($kpiFilter === 'history' && $canViewHistoryRow): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-ghost btn-sm">View <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php elseif (in_array($kpiFilter, ['awaiting', 'post_approval'], true) && !empty($row['can_process'])): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-primary btn-sm">Process <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php elseif ($kpiFilter !== 'history' && ($kpiFilter !== 'awaiting' || !empty($row['can_view']))): ?>
                            <a href="<?= url('forms/view/' . $row['id']) ?>" class="btn btn-ghost btn-sm">View <i class="ti ti-arrow-right ti-xs"></i></a>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($kpiRows)): ?>
            <tr><td colspan="<?= $kpiFilter === 'history' ? 9 : 6 ?>" class="muted text-center">No matching records found.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
    <?php if ($kpiTotalPages > 1): ?>
        <?php
            $paginationStart = max(1, $kpiPage - 2);
            $paginationEnd = min($kpiTotalPages, $kpiPage + 2);
            $pageUrl = static fn(int $page): string => url('dashboard?kpi=' . rawurlencode($kpiFilter)
                . '&page=' . $page
                . ($kpiSearchQuery !== '' ? '&search=' . rawurlencode($kpiSearchQuery) : ''));
        ?>
        <nav class="dashboard-pagination" aria-label="Request pages">
            <?php if ($kpiPage > 1): ?>
                <a href="<?= $pageUrl($kpiPage - 1) ?>" aria-label="Previous page">Previous</a>
            <?php endif; ?>
            <?php if ($paginationStart > 1): ?>
                <a href="<?= $pageUrl(1) ?>">1</a>
                <?php if ($paginationStart > 2): ?><span aria-hidden="true">...</span><?php endif; ?>
            <?php endif; ?>
            <?php for ($pageNumber = $paginationStart; $pageNumber <= $paginationEnd; $pageNumber++): ?>
                <a href="<?= $pageUrl($pageNumber) ?>" class="<?= $pageNumber === $kpiPage ? 'active' : '' ?>" <?= $pageNumber === $kpiPage ? 'aria-current="page"' : '' ?>><?= $pageNumber ?></a>
            <?php endfor; ?>
            <?php if ($paginationEnd < $kpiTotalPages): ?>
                <?php if ($paginationEnd < $kpiTotalPages - 1): ?><span aria-hidden="true">...</span><?php endif; ?>
                <a href="<?= $pageUrl($kpiTotalPages) ?>"><?= $kpiTotalPages ?></a>
            <?php endif; ?>
            <?php if ($kpiPage < $kpiTotalPages): ?>
                <a href="<?= $pageUrl($kpiPage + 1) ?>" aria-label="Next page">Next</a>
            <?php endif; ?>
        </nav>
    <?php endif; ?>
</div>
<?php elseif (($roleId !== 3 || in_array($kpiFilter, ['history', 'awaiting', 'post_approval', 'drafts', 'completed', 'approved', 'rejected', 'pending'], true)) && $kpiFilter !== ''): ?>
<div class="table-wrap dashboard-kpi-table">
    <div class="empty-state empty-state-padded">No records found.</div>
</div>
<?php endif; ?>

<div class="ars-modal-backdrop" id="deleteModal" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle" hidden>
    <div class="ars-modal">
        <div class="ars-modal-icon ars-modal-icon--danger">
            <i class="ti ti-trash"></i>
        </div>
        <h3 class="ars-modal-title" id="deleteModalTitle">Delete Draft?</h3>
        <p class="ars-modal-body">
            You're about to permanently delete <strong id="deleteModalFormName"></strong>.
            This action cannot be undone.
        </p>
        <div class="ars-modal-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-modal-close="deleteModal">
                Cancel
            </button>
            <button type="button" class="btn btn-danger btn-sm" id="btn-delete-confirm">
                <i class="ti ti-trash"></i> Yes, Delete
            </button>
        </div>
    </div>
</div>

<!-- ── Section row: Activity + Right column ── -->
<div class="section-row">

    <!-- Activity feed -->
    <div class="card-panel">
        <div class="card-panel-header">
            <span class="card-panel-title">Recent Activity</span>
            <?php $allLink = ($roleId === 1)
                ? url('requests')
                : (in_array($roleId, [ 2, 4, 5, 6, 7, 8, 9 ], true)
                    ? url('approvals')
                    : url('dashboard'));
            ?>
            <a href="<?= $allLink ?>" class="card-panel-link">View all →</a>
        </div>
        <?php if (empty($forms)): ?>
            <div class="empty-state">
                <i class="ti ti-inbox empty-state-icon"></i>
                No activity yet.
            </div>
        <?php else: ?>
            <?php foreach (array_slice($forms, 0, 8) as $form):
                $ic = $iconMap[$form['form_type']] ?? ['bg' => '#e2e8f0', 'color' => '#64748b', 'icon' => 'ti-file'];
                $ago = (new DateTime())->diff(new DateTime($form['created_at']));
                $timeStr = $ago->days >= 1
                    ? date('M d', strtotime($form['created_at']))
                    : ($ago->h >= 1 ? $ago->h . 'h ago' : ($ago->i >= 1 ? $ago->i . 'm ago' : 'Just now'));
                $humanStatus = $statusLabels[$form['status']] ?? ucwords(str_replace('_', ' ', $form['status']));
            ?>
            <a href="<?= url('forms/view/' . $form['id']) ?>" class="activity-item activity-link">
                <div class="activity-icon activity-icon-dynamic" data-bg="<?= $ic['bg'] ?>" data-color="<?= $ic['color'] ?>">
                    <i class="ti <?= $ic['icon'] ?>"></i>
                </div>
                <div class="activity-text-wrap">
                    <div class="activity-text"><?= htmlspecialchars($formLabel[$form['form_type']] ?? $form['form_type']) ?></div>
                    <div class="activity-sub"><?= htmlspecialchars($form['full_name']) ?></div>
                </div>
                <div class="activity-time">
                    <div><?= $timeStr ?></div>
                    <span class="badge badge-<?= $badgeMap[$form['status']] ?? 'secondary' ?>">
                        <?= htmlspecialchars($humanStatus) ?>
                    </span>
                </div>
            </a>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Right column -->
    <div class="dashboard-cols">

        <!-- Form volume -->
        <div class="card-panel">
            <div class="card-panel-header">
                <span class="card-panel-title">Form Volume</span>
                <span class="card-panel-hint">Last 30 days</span>
            </div>
            <?php if (empty($typeCounts)): ?>
                <div class="empty-state empty-state-padded">No data yet.</div>
            <?php else:
                foreach ($typeCounts as $type => $count):
                    $pct = round(($count / $maxTypeCount) * 100);
                    $barColor = $iconMap[$type]['barColor'] ?? '#94a3b8';
            ?>
            <div class="vol-row">
                <span class="vol-label"><?= $formLabel[$type] ?? $type ?></span>
                <div class="vol-bar">
                    <div class="vol-fill" data-pct="<?= $pct ?>" data-color="<?= $barColor ?>"></div>
                </div>
                <span class="vol-count"><?= $count ?></span>
            </div>
            <?php endforeach; endif; ?>
        </div> 

    </div>
</div>

<?php
$content = ob_get_clean();
$pageTitle = 'Dashboard';
require __DIR__ . '/base.php';