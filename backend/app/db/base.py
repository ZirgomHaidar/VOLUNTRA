# Import all the models, so that Base has them before being
# imported by Alembic or used by the app
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.event import Event  # noqa
from app.models.skill import UserSkill  # noqa
from app.models.portfolio import Portfolio, Media  # noqa
from app.models.document import Document  # noqa
from app.models.reliability import Participation, Feedback  # noqa
from app.models.tracking import LocationLog  # noqa
