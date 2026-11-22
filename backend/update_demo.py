
from database import SessionLocal
from models import User


db = SessionLocal()

try:
    resident = db.query(User).filter_by(
        email="resident@gmail.com"
    ).one()

    ra = db.query(User).filter_by(
        email="ra@gmail.com"
    ).one()

    manager = db.query(User).filter_by(
        email="manager@gmail.com"
    ).one()

    resident.name = "Resident Roomie"

    ra.name = "Resident Assistant"
    ra.email = "resident.assistant@gmail.com"

    manager.name = "Casey"
    manager.email = "property.manager@gmail.com"

    db.commit()

    print("Demo accounts updated successfully!")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
