from decimal import Decimal
from typing import Annotated

from pydantic import PlainSerializer

# Money is stored as NUMERIC(10,2) and sent to clients as a JSON number (e.g. 1200.5).
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]
