// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: key_update.sql

package database

import (
	"context"
	"database/sql"
	"time"
)

const updateKey = `-- name: UpdateKey :exec
UPDATE
    ` + "`" + `keys` + "`" + `
SET
    hash = ?,
    start = ?,
    owner_id = ?,
    meta = ?,
    created_at = ?,
    expires = ?,
    ratelimit_type = ?,
    ratelimit_limit = ?,
    ratelimit_refill_rate = ?,
    ratelimit_refill_interval = ?,
    name = ?,
    remaining_requests = ?
WHERE
    id = ?
`

type UpdateKeyParams struct {
	Hash                    string
	Start                   string
	OwnerID                 sql.NullString
	Meta                    sql.NullString
	CreatedAt               time.Time
	Expires                 sql.NullTime
	RatelimitType           sql.NullString
	RatelimitLimit          sql.NullInt32
	RatelimitRefillRate     sql.NullInt32
	RatelimitRefillInterval sql.NullInt32
	Name                    sql.NullString
	RemainingRequests       sql.NullInt32
	ID                      string
}

func (q *Queries) UpdateKey(ctx context.Context, arg UpdateKeyParams) error {
	_, err := q.db.ExecContext(ctx, updateKey,
		arg.Hash,
		arg.Start,
		arg.OwnerID,
		arg.Meta,
		arg.CreatedAt,
		arg.Expires,
		arg.RatelimitType,
		arg.RatelimitLimit,
		arg.RatelimitRefillRate,
		arg.RatelimitRefillInterval,
		arg.Name,
		arg.RemainingRequests,
		arg.ID,
	)
	return err
}