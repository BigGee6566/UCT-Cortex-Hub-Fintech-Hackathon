"""add redirect_uri to open_banking_consents

Revision ID: 0002_add_consent_redirect_uri
Revises: 0001_initial
Create Date: 2026-01-29

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_add_consent_redirect_uri"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "open_banking_consents",
        sa.Column("redirect_uri", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("open_banking_consents", "redirect_uri")
