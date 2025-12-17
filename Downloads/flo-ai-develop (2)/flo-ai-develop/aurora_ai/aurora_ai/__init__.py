"""
aurora_ai - A flexible agent framework for LLM-powered applications
"""

# Models package - Agent framework components
from .models import (
    Agent,
    AgentError,
    BaseAgent,
    AgentType,
    ReasoningPattern,
    DocumentType,
    MessageType,
    SystemMessage,
    UserMessage,
    AssistantMessage,
    FunctionMessage,
    BaseMessage,
    MediaMessageContent,
    TextMessageContent,
    ImageMessageContent,
    DocumentMessageContent,
)

from .builder.agent_builder import AgentBuilder

# LLM package - Language model integrations
from .llm import BaseLLM, Anthropic, OpenAI, OllamaLLM, Gemini, OpenAIVLLM

# Tool package - Tool framework components
from .tool import Tool, ToolExecutionError, aurora_tool, create_tool_from_function

# Arium package - Workflow and memory components
from .arium import (
    aurora,
    Baseaurora,
    MessageMemory,
    BaseMemory,
    StartNode,
    EndNode,
    Edge,
    auroraBuilder,
    auroraEvent,
    auroraEventType,
    MessageMemoryItem,
    default_event_callback,
    create_aurora,
)

# Utils package - Utility functions
from .utils import FloUtils

# Telemetry package - OpenTelemetry integration
from .telemetry import (
    configure_telemetry,
    shutdown_telemetry,
    get_tracer,
    get_meter,
    FloTelemetry,
)

__all__ = [
    # Models
    'Agent',
    'AgentError',
    'BaseAgent',
    'AgentType',
    'ReasoningPattern',
    'MessageType',
    'SystemMessage',
    'UserMessage',
    'AssistantMessage',
    'FunctionMessage',
    'HumanMessage',
    'AIMessage',
    'BaseMessage',
    'MediaMessageContent',
    'TextMessageContent',
    'ImageMessageContent',
    'DocumentMessageContent',
    # Utils
    'FloUtils',
    # LLM
    'BaseLLM',
    'Anthropic',
    'OpenAI',
    'OllamaLLM',
    'Gemini',
    'OpenAIVLLM',
    # LLM DataClass
    'DocumentType',
    # Tools
    'Tool',
    'ToolExecutionError',
    'aurora_tool',
    'create_tool_from_function',
    # arium
    'aurora',
    'Baseaurora',
    'create_aurora',
    'MessageMemory',
    'BaseMemory',
    'MessageMemoryItem',
    'StartNode',
    'EndNode',
    'Edge',
    # Builder
    'AgentBuilder',
    'auroraBuilder',
    # Arium Event system
    'auroraEventType',
    'auroraEvent',
    'default_event_callback',
    # Telemetry
    'configure_telemetry',
    'shutdown_telemetry',
    'get_tracer',
    'get_meter',
    'FloTelemetry',
]

__version__ = '1.0.0'
