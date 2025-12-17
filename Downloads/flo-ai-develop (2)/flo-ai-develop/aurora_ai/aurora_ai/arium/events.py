"""
Event system for aurora workflow execution monitoring.

This module provides event types and data structures for tracking workflow execution,
including node starts/completions, router decisions, and workflow lifecycle events.
"""

from enum import Enum
from dataclasses import dataclass
from typing import Optional
import time
from aurora_ai.utils.logger import logger


class auroraEventType(Enum):
    """Enumeration of all possible aurora workflow events."""

    WORKFLOW_STARTED = 'workflow_started'
    WORKFLOW_COMPLETED = 'workflow_completed'
    WORKFLOW_FAILED = 'workflow_failed'
    NODE_STARTED = 'node_started'
    NODE_COMPLETED = 'node_completed'
    NODE_FAILED = 'node_failed'
    ROUTER_DECISION = 'router_decision'
    EDGE_TRAVERSED = 'edge_traversed'


@dataclass
class auroraEvent:
    """
    Data structure representing a single workflow execution event.

    Attributes:
        event_type: The type of event that occurred
        timestamp: Unix timestamp when the event occurred
        node_name: Name of the node involved (if applicable)
        node_type: Type of node ('agent', 'tool', 'start', 'end')
        execution_time: Time taken for node execution in seconds
        error: Error message if the event represents a failure
        router_choice: The node chosen by a router decision
        metadata: Additional event-specific data
    """

    event_type: auroraEventType
    timestamp: float
    node_name: Optional[str] = None
    node_type: Optional[str] = None
    execution_time: Optional[float] = None
    error: Optional[str] = None
    router_choice: Optional[str] = None
    metadata: Optional[dict] = None


def default_event_callback(event: auroraEvent) -> None:
    """
    Default callback function that prints workflow events to console with formatting.

    This provides useful output for debugging and monitoring workflow execution
    without requiring any custom callback setup.

    Args:
        event: The auroraEvent to process and display
    """
    timestamp = time.strftime('%H:%M:%S', time.localtime(event.timestamp))

    if event.event_type == auroraEventType.WORKFLOW_STARTED:
        logger.info(f'🚀 [{timestamp}] Workflow started')

    elif event.event_type == auroraEventType.WORKFLOW_COMPLETED:
        logger.info(f'✅ [{timestamp}] Workflow completed')

    elif event.event_type == auroraEventType.WORKFLOW_FAILED:
        logger.error(f'❌ [{timestamp}] Workflow failed: {event.error}')

    elif event.event_type == auroraEventType.NODE_STARTED:
        node_desc = (
            f'{event.node_type}: {event.node_name}'
            if event.node_type
            else event.node_name
        )
        logger.info(f'⚡ [{timestamp}] Started {node_desc}')

    elif event.event_type == auroraEventType.NODE_COMPLETED:
        duration = f' ({event.execution_time:.2f}s)' if event.execution_time else ''
        logger.info(f'✅ [{timestamp}] Completed {event.node_name}{duration}')

    elif event.event_type == auroraEventType.NODE_FAILED:
        logger.error(f'❌ [{timestamp}] Failed {event.node_name}: {event.error}')

    elif event.event_type == auroraEventType.ROUTER_DECISION:
        logger.info(f'🔀 [{timestamp}] Router chose: {event.router_choice}')

    elif event.event_type == auroraEventType.EDGE_TRAVERSED:
        logger.info(f'➡️  [{timestamp}] Moving from {event.node_name} to next node')
