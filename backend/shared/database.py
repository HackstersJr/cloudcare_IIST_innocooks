"""
Shared Database Configuration for CloudCare
All 5 FastAPI servers use this shared Prisma client
"""

from prisma import Prisma
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import os
from dotenv import load_dotenv

load_dotenv()

# Global Prisma client instance
prisma_client = Prisma()


async def connect_db():
    """Connect to the database"""
    if not prisma_client.is_connected():
        await prisma_client.connect()
        print("✓ Database connected successfully")


async def disconnect_db():
    """Disconnect from the database"""
    if prisma_client.is_connected():
        await prisma_client.disconnect()
        print("✓ Database disconnected")


@asynccontextmanager
async def get_db() -> AsyncGenerator[Prisma, None]:
    """
    Get database session as a context manager
    Usage:
        async with get_db() as db:
            result = await db.patient.find_first(...)
    """
    if not prisma_client.is_connected():
        await connect_db()
    try:
        yield prisma_client
    except Exception as e:
        print(f"Database error: {e}")
        raise


def get_prisma() -> Prisma:
    """
    Get the Prisma client instance directly
    For use with FastAPI dependencies
    """
    return prisma_client
