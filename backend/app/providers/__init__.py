from app.providers.base import OpenBankingProvider
from app.providers.finhub import FinHubProvider


def get_provider() -> OpenBankingProvider:
    # Currently we only support the UCT FinHub sandbox. This factory
    # makes it trivial to add additional providers later.
    return FinHubProvider()
