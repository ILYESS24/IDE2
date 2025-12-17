"""
Redis-based caching for Aurora AI API responses
"""
import json
import hashlib
import redis
import os
from typing import Optional, Any
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class AICache:
    """Simple Redis-based cache for AI responses"""

    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.enabled = os.getenv("CACHE_ENABLED", "false").lower() == "true"
        self.ttl = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default

        if self.enabled:
            try:
                self.redis = redis.from_url(self.redis_url)
                # Test connection
                self.redis.ping()
                logger.info("✅ Redis cache connected")
            except redis.ConnectionError:
                logger.warning("⚠️  Redis not available, cache disabled")
                self.enabled = False
        else:
            logger.info("ℹ️  Cache disabled (CACHE_ENABLED=false)")
            self.redis = None

    def _get_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate a unique cache key from function name and arguments"""
        # Create a hash of the arguments (excluding sensitive data)
        args_str = json.dumps(args, sort_keys=True, default=str)
        kwargs_str = json.dumps(kwargs, sort_keys=True, default=str)
        content = f"{func_name}:{args_str}:{kwargs_str}"

        # Hash for consistent key length
        return f"ai_cache:{hashlib.md5(content.encode()).hexdigest()}"

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.redis:
            return None

        try:
            cached = self.redis.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.warning(f"Cache get error: {e}")

        return None

    def set(self, key: str, value: Any) -> bool:
        """Set value in cache"""
        if not self.enabled or not self.redis:
            return False

        try:
            self.redis.setex(key, self.ttl, json.dumps(value, default=str))
            return True
        except Exception as e:
            logger.warning(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if not self.enabled or not self.redis:
            return False

        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            logger.warning(f"Cache delete error: {e}")
            return False

    def clear_all(self) -> bool:
        """Clear all cache entries"""
        if not self.enabled or not self.redis:
            return False

        try:
            # Delete all keys with ai_cache prefix
            keys = self.redis.keys("ai_cache:*")
            if keys:
                return bool(self.redis.delete(*keys))
            return True
        except Exception as e:
            logger.warning(f"Cache clear error: {e}")
            return False

def cached_ai_response(func):
    """
    Decorator to cache AI responses based on input parameters
    Only caches successful responses, not errors
    """
    cache = AICache()

    @wraps(func)
    async def wrapper(*args, **kwargs):
        if not cache.enabled:
            return await func(*args, **kwargs)

        # Generate cache key
        cache_key = cache._get_cache_key(func.__name__, args, kwargs)

        # Try to get from cache first
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"✅ Cache hit for {func.__name__}")
            return cached_result

        # Execute function
        try:
            result = await func(*args, **kwargs)

            # Cache successful results only
            if result and cache.set(cache_key, result):
                logger.info(f"💾 Cached response for {func.__name__}")

            return result

        except Exception as e:
            # Don't cache errors
            logger.warning(f"Function {func.__name__} failed: {e}")
            raise

    return wrapper

# Global cache instance
ai_cache = AICache()
