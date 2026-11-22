
import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent / "roomies.db"


def migrate():

    if not DB_PATH.exists():
        raise FileNotFoundError("Roomies database not found.")

    with sqlite3.connect(DB_PATH) as connection:

        columns = connection.execute(
            "PRAGMA table_info(support_requests)"
        ).fetchall()

        column_names = [column[1] for column in columns]

        if not columns:
            raise RuntimeError("Support requests table not found.")

        if "photo" not in column_names:

            connection.execute(
                "ALTER TABLE support_requests ADD COLUMN photo TEXT"
            )

            print("Photo column added successfully.")

        else:
            print("Photo column already exists.")

        connection.commit()

    print("Database migration complete.")


if __name__ == "__main__":
    migrate()
