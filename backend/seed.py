
import os

from dotenv import load_dotenv
from pathlib import Path
from pwdlib import PasswordHash

from database import SessionLocal, Base, engine

from models import (
    User,
    Property,
    ResidentialGroup,
    Household,
    ResidentProfile
)


# Load local environment variables.
load_dotenv(Path(__file__).resolve().parent / ".env")

password_hasher = PasswordHash.recommended()

Base.metadata.create_all(bind=engine)


def seed_database():

    # Require a password supplied through an environment variable.
    demo_password = os.environ["DEMO_ACCOUNT_PASSWORD"]

    db = SessionLocal()

    try:

        # Prevent duplicate demo accounts.
        existing_user = db.query(User).filter(
            User.email == "resident@gmail.com"
        ).first()

        if existing_user:
            print("Demo resident already exists. Skipping seed.")
            return

        # Create resident account.
        resident = User(
            name="Resident Roomie",
            email="resident@gmail.com",
            password_hash=password_hasher.hash(demo_password),
            role="resident"
        )

        # Create RA account.
        ra = User(
            name="Resident Assistant",
            email="resident.assistant@gmail.com",
            password_hash=password_hasher.hash(demo_password),
            role="ra"
        )

        # Create property manager account.
        manager = User(
            name="Casey",
            email="property.manager@gmail.com",
            password_hash=password_hasher.hash(demo_password),
            role="manager"
        )

        db.add_all([resident, ra, manager])
        db.flush()

        # Assign the property manager.
        property_record = Property(
            name="Roomies Apartments",
            manager_id=manager.id
        )

        db.add(property_record)
        db.flush()

        # Assign the RA to a residential group.
        group = ResidentialGroup(
            name="Building A",
            property_id=property_record.id,
            ra_id=ra.id
        )

        db.add(group)
        db.flush()

        # Create a household within the group.
        household = Household(
            name="Apartment 204",
            group_id=group.id
        )

        db.add(household)
        db.flush()

        # Assign the resident to the household.
        profile = ResidentProfile(
            user_id=resident.id,
            household_id=household.id
        )

        db.add(profile)

        db.commit()

        print("Database seeded successfully!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
