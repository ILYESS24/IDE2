from typing import List, Optional, Callable, Union, Dict, Any
from .arium import aurora
from .memory import MessageMemory, BaseMemory, MessageMemoryItem
from .protocols import ExecutableNode
from .nodes import auroraNode, ForEachNode
from aurora_ai.models import BaseMessage, UserMessage
from aurora_ai.models.agent import Agent, resolve_variables
from aurora_ai.tool.base_tool import Tool
import yaml
from aurora_ai.builder.agent_builder import AgentBuilder
from aurora_ai.llm import BaseLLM
from .llm_router import create_llm_router
from .nodes import FunctionNode


class auroraBuilder:
    """
    A builder class for creating and configuring aurora instances with a fluent interface.

    Example usage:
        result = (auroraBuilder()
                  .with_memory(my_memory)
                  .add_agent(agent1)
                  .add_function_node(function_node1)
                  .start_with(agent1)
                  .add_edge(agent1, [function_node1], router_fn)
                  .end_with(function_node1)
                  .build_and_run(["Hello, world!"]))
    """

    def __init__(self):
        self._memory: Optional[BaseMemory] = None
        self._agents: List[Agent] = []
        self._auroras: List[
            auroraNode
        ] = []  # only those auroras which are part of main workflow
        self._foreach_nodes: List[ForEachNode] = []
        self._start_node: Optional[ExecutableNode] = None
        self._end_nodes: List[ExecutableNode] = []
        self._function_nodes: List[FunctionNode] = []
        self._edges: List[tuple] = []  # (from_node, to_nodes, router)
        self._aurora: Optional[aurora] = None
        self._all_auroras: List[
            auroraNode
        ] = []  # all the auroras either of main workflow or when used as a node in foreachnode or any sub workflow

    def with_memory(self, memory: BaseMemory) -> 'auroraBuilder':
        """Set the memory for the aurora."""
        self._memory = memory
        return self

    def add_agent(self, agent: Agent) -> 'auroraBuilder':
        """Add an agent to the aurora."""
        self._agents.append(agent)
        return self

    def add_agents(self, agents: List[Agent]) -> 'auroraBuilder':
        """Add multiple agents to the aurora."""
        self._agents.extend(agents)
        return self

    def add_function_node(self, function_node: FunctionNode) -> 'auroraBuilder':
        """Add a function node to the aurora."""
        self._function_nodes.append(function_node)
        return self

    def add_function_nodes(self, function_nodes: List[FunctionNode]) -> 'auroraBuilder':
        """Add multiple function nodes to the aurora."""
        self._function_nodes.extend(function_nodes)
        return self

    def add_aurora(
        self, aurora: aurora, name: Optional[str] = None, inherit_variables: bool = True
    ) -> 'auroraBuilder':
        """
        Add an aurora workflow as a node.

        Args:
            aurora: The aurora to add as a node
            name: Name for this node (defaults to aurora's name or auto-generated)
            inherit_variables: Whether to inherit parent variables

        Returns:
            auroraBuilder: Self for method chaining
        """
        # Generate name if not provided
        node_name = name or getattr(aurora, 'name', f'aurora_node_{len(self._auroras)}')

        aurora_node = auroraNode(
            name=node_name, aurora=aurora, inherit_variables=inherit_variables
        )
        self._auroras.append(aurora_node)
        self._all_auroras.append(aurora_node)
        return self

    def add_foreach(
        self, name: str, execute_node: Union[ExecutableNode, str]
    ) -> 'auroraBuilder':
        """
        Add a ForEach node for batch processing.

        The ForEach node will iterate over all items in memory when executed.
        Execution is sequential only for now (future - parallel would also be supported).

        Args:
            name: Name for the ForEach node
            execute_node: Node to execute on each item (node object or name string)

        Returns:
            auroraBuilder: Self for method chaining
        """
        # Resolve node reference if string name provided
        if isinstance(execute_node, str):
            # Search across all node types
            all_nodes = (
                self._agents + self._function_nodes + self._auroras + self._foreach_nodes
            )
            resolved_node = next((n for n in all_nodes if n.name == execute_node), None)
            if not resolved_node:
                raise ValueError(f"Node '{execute_node}' not found")
            execute_node = resolved_node

        foreach = ForEachNode(name=name, execute_node=execute_node)

        self._foreach_nodes.append(foreach)
        if isinstance(execute_node, auroraNode):
            if execute_node not in self._all_auroras:
                self._all_auroras.append(execute_node)
        return self

    def start_with(self, node: ExecutableNode | str) -> 'auroraBuilder':
        """Set the starting node for the aurora."""
        if isinstance(node, str):
            # Search across all node types
            all_nodes = (
                self._agents + self._function_nodes + self._auroras + self._foreach_nodes
            )
            resolved_node = next((n for n in all_nodes if n.name == node), None)
            if not resolved_node:
                raise ValueError(f"Node '{node}' not found")
            node = resolved_node
        self._start_node = node
        return self

    def end_with(self, node: ExecutableNode) -> 'auroraBuilder':
        """Add an ending node to the aurora."""
        if node not in self._end_nodes:
            self._end_nodes.append(node)
        return self

    def add_edge(
        self,
        from_node: ExecutableNode,
        to_nodes: List[ExecutableNode],
        router: Optional[Callable] = None,
    ) -> 'auroraBuilder':
        """Add an edge between nodes with an optional router function."""
        self._edges.append((from_node, to_nodes, router))
        return self

    def connect(
        self,
        from_node: ExecutableNode | str,
        to_node: ExecutableNode | str,
    ) -> 'auroraBuilder':
        """Simple connection between two nodes without a router."""

        if isinstance(from_node, str):
            # Search across all node types
            all_nodes = (
                self._agents + self._function_nodes + self._auroras + self._foreach_nodes
            )
            resolved_from_node = next(
                (n for n in all_nodes if n.name == from_node), None
            )
            if not resolved_from_node:
                raise ValueError(f"Node '{from_node}' not found")
            from_node = resolved_from_node

        if isinstance(to_node, str):
            # Search across all node types
            all_nodes = (
                self._agents + self._function_nodes + self._auroras + self._foreach_nodes
            )
            resolved_to_node = next((n for n in all_nodes if n.name == to_node), None)
            if not resolved_to_node:
                raise ValueError(f"Node '{to_node}' not found")
            to_node = resolved_to_node

        return self.add_edge(from_node, [to_node])

    def build(self) -> aurora:
        """Build the aurora instance from the configured components."""
        # Use default memory if none provided
        if self._memory is None:
            self._memory = MessageMemory()

        # Create aurora instance
        aurora = aurora(self._memory)

        # Add all nodes
        all_nodes = []
        all_nodes.extend(self._agents)
        all_nodes.extend(self._function_nodes)
        all_nodes.extend(self._auroras)
        all_nodes.extend(self._foreach_nodes)

        if not all_nodes:
            raise ValueError('No agents or function nodes added to the aurora')

        aurora.add_nodes(all_nodes)

        # Set start node
        if self._start_node is None:
            raise ValueError(
                'No start node specified. Use start_with() to set a start node.'
            )

        aurora.start_at(self._start_node)

        # Add edges
        for from_node, to_nodes, router in self._edges:
            aurora.add_edge(from_node.name, [node.name for node in to_nodes], router)

        # Add end nodes
        if not self._end_nodes:
            raise ValueError('No end nodes specified. Use end_with() to add end nodes.')

        for end_node in self._end_nodes:
            aurora.add_end_to(end_node)

        # Compile all aurora Nodes before compiling parent
        for aurora_node in self._all_auroras:
            if not aurora_node.aurora.is_compiled:
                aurora_node.aurora.compile()

        # Compile the aurora
        aurora.compile()

        self._aurora = aurora
        return aurora

    async def build_and_run(
        self,
        inputs: List[BaseMessage] | str,
        variables: Optional[Dict[str, Any]] = None,
    ) -> List[MessageMemoryItem]:
        """Build the aurora and run it with the given inputs and optional runtime variables."""
        aurora = self.build()
        new_inputs = []
        for input in inputs:
            if isinstance(input, str):
                new_inputs.append(UserMessage(resolve_variables(input, variables)))
            elif isinstance(input, BaseMessage):
                new_inputs.append(input)
            else:
                raise ValueError(f'Invalid input type: {type(input)}')
        return await aurora.run(new_inputs, variables=variables)

    def visualize(
        self, output_path: str = 'aurora_graph.png', title: str = 'aurora Workflow'
    ) -> 'auroraBuilder':
        """Generate a visualization of the aurora graph."""
        if self._aurora is None:
            self.build()

        self._aurora.visualize_graph(output_path=output_path, graph_title=title)
        return self

    def reset(self) -> 'auroraBuilder':
        """Reset the builder to start fresh."""
        self._memory = None
        self._agents = []
        self._function_nodes = []
        self._auroras = []
        self._foreach_nodes = []
        self._start_node = None
        self._end_nodes = []
        self._edges = []
        self._aurora = None
        return self

    @classmethod
    def from_yaml(
        cls,
        yaml_str: Optional[str] = None,
        yaml_file: Optional[str] = None,
        memory: Optional[BaseMemory] = None,
        agents: Optional[Dict[str, Agent]] = None,
        routers: Optional[Dict[str, Callable]] = None,
        base_llm: Optional[BaseLLM] = None,
        function_registry: Optional[Dict[str, Callable]] = None,
        tool_registry: Optional[Dict[str, Tool]] = None,
        **kwargs,
    ) -> 'auroraBuilder':
        """Create an auroraBuilder from a YAML configuration.

        Args:
            yaml_str: YAML string containing aurora configuration
            yaml_file: Path to YAML file containing aurora configuration
            memory: Memory instance to use for the workflow (defaults to MessageMemory)
            agents: Dictionary mapping agent names to pre-built Agent instances
            routers: Dictionary mapping router names to router functions
            base_llm: Base LLM to use for all agents if not specified in individual agent configs
            function_registry: Dictionary mapping function names to function objects
            tool_registry: Dictionary mapping tool names to Tool objects
        Returns:
            auroraBuilder: Configured builder instance

        Example YAML structure:
            metadata:
              name: my-workflow
              version: 1.0.0
              description: "Example workflow"

            aurora:
              agents:
                # Method 1: Reference pre-built agents
                - name: content_analyst  # Must exist in agents parameter
                - name: summarizer       # Must exist in agents parameter

                # Method 2: Direct agent definition
                - name: validator
                  role: "Data Validator"
                  job: "You are a data validator"
                  model:
                    provider: openai
                    name: gpt-4o-mini
                  settings:
                    temperature: 0.1

                # Method 3: Inline YAML configuration
                - name: processor
                  yaml_config: |
                    agent:
                      name: processor
                      job: "You are a data processor"
                      model:
                        provider: openai
                        name: gpt-4o-mini

                # Method 4: External file reference
                - name: reporter
                  yaml_file: "path/to/reporter.yaml"

              function_nodes:
                - name: function1
                  function_name: function1
                - name: function2
                  function_name: function2
                  description: "Function 2"
                  input_filter: ["input1", "input2"]
                  prefilled_params:
                    param1: "value1"
                    param2: "value2"
              # LLM Router definitions (NEW)
              routers:
                - name: content_router
                  type: smart  # smart, task_classifier, conversation_analysis, reflection, plan_execute
                  routing_options:
                    technical_writer: "Handle technical documentation tasks"
                    creative_writer: "Handle creative writing tasks"
                    editor: "Handle editing and review tasks"
                  model:
                    provider: openai
                    name: gpt-4o-mini
                  settings:
                    temperature: 0.3
                    fallback_strategy: first

                # Reflection router for A -> B -> A -> C patterns
                - name: main_critic_reflection
                  type: reflection
                  flow_pattern: [main_agent, critic, main_agent, final_agent]
                  settings:
                    allow_early_exit: false

                # Plan-Execute router for Cursor-style workflows
                - name: plan_execute_router
                  type: plan_execute
                  agents:
                    planner: "Creates detailed execution plans"
                    developer: "Implements code and features"
                    tester: "Tests implementations"
                    reviewer: "Reviews final results"
                  settings:
                    planner_agent: planner
                    executor_agent: developer
                    reviewer_agent: reviewer

              # auroraNode definitions (nested aurora workflows)
              aurora_nodes:
                # Method 1: Inline nested aurora definition
                - name: document_processor
                  inherit_variables: true  # optional, default: true
                  agents:
                    - name: classifier
                      job: "Classify documents"
                      model:
                        provider: openai
                        name: gpt-4o-mini
                    - name: specialist
                      job: "Process classified documents"
                      model:
                        provider: openai
                        name: gpt-4o-mini
                  workflow:
                    start: classifier
                    edges:
                      - from: classifier
                        to: [specialist]
                    end: [specialist]

                # Method 2: External YAML file reference
                - name: complex_processor
                  yaml_file: "workflows/document_classifier.yaml"
                  inherit_variables: false

              # ForEachNode definitions
              foreach_nodes:
                - name: batch_processor
                  execute_node: document_processor  # Can reference any node type

              workflow:
                start: batch_processor  # Can reference any node type including foreach/aurora nodes
                edges:
                  - from: content_analyst
                    to: [validator, summarizer]
                    router: content_router  # References router defined above
                  - from: validator
                    to: [processor]
                  - from: summarizer
                    to: [reporter]
                  - from: processor
                    to: [end]
                  - from: reporter
                    to: [end]
                end: [processor, reporter]
        """
        if yaml_str is None and yaml_file is None:
            raise ValueError('Either yaml_str or yaml_file must be provided')

        if yaml_str and yaml_file:
            raise ValueError('Only one of yaml_str or yaml_file should be provided')

        # Load YAML configuration
        if yaml_str:
            config = yaml.safe_load(yaml_str)
        else:
            with open(yaml_file, 'r') as f:
                config = yaml.safe_load(f)

        if 'aurora' not in config:
            raise ValueError('YAML must contain an "aurora" section')

        aurora_config = config['aurora']
        builder = cls()

        # Configure memory - use provided memory or default to MessageMemory
        if memory is not None:
            builder.with_memory(memory)
        else:
            builder.with_memory(MessageMemory())

        # Process agents
        agents_config = aurora_config.get('agents', [])
        agents_dict = {}

        for agent_config in agents_config:
            agent_name = agent_config['name']

            # Method 1: Reference pre-built agent
            if len(agent_config) == 1 and 'name' in agent_config:
                # Only has name field, so it's a reference to a pre-built agent
                if agents and agent_name in agents:
                    agent = agents[agent_name]
                else:
                    raise ValueError(
                        f'Agent {agent_name} not found in provided agents dictionary. '
                        f'Available agents: {list(agents.keys()) if agents else []}. '
                        f'Either provide the agent in the agents parameter or add configuration fields.'
                    )

            elif agents and agent_name in agents:
                agent = agents[agent_name]

            # Method 2: Direct agent definition
            elif (
                'job' in agent_config
                and 'yaml_config' not in agent_config
                and 'yaml_file' not in agent_config
            ):
                agent = cls._create_agent_from_direct_config(
                    agent_config, base_llm, tool_registry, **kwargs
                )

            # Method 3: Inline YAML config
            elif 'yaml_config' in agent_config:
                agent_builder = AgentBuilder.from_yaml(
                    yaml_str=agent_config['yaml_config'],
                    base_llm=base_llm,
                    tool_registry=tool_registry,
                )
                agent = agent_builder.build()

            # Method 4: External file reference
            elif 'yaml_file' in agent_config:
                agent_builder: AgentBuilder = AgentBuilder.from_yaml(
                    yaml_file=agent_config['yaml_file'],
                    base_llm=base_llm,
                    tool_registry=tool_registry,
                )
                agent = agent_builder.build()

            else:
                raise ValueError(
                    f'Agent {agent_name} must have either:\n'
                    f'  - Only a name (to reference pre-built agent),\n'
                    f'  - Direct configuration (job field),\n'
                    f'  - yaml_config, or\n'
                    f'  - yaml_file'
                )

            agents_dict[agent_name] = agent
            builder.add_agent(agent)

        # Process function nodes
        function_nodes_config = aurora_config.get('function_nodes', [])
        function_nodes_dict = {}

        for function_node_config in function_nodes_config:
            function_node_name = function_node_config['name']
            function_name = function_node_config['function_name']
            prefilled_params = function_node_config.get('prefilled_params', None)
            description = function_node_config.get('description', None)
            input_filter = function_node_config.get('input_filter', None)
            function = function_registry.get(function_name)

            if function is None:
                raise ValueError(
                    f'Function {function_name} not found in provided function_registry dictionary. '
                    f'Available functions: {list[str](function_registry.keys()) if function_registry else []}. '
                    f'Either provide the function in the function_registry parameter or add configuration fields.'
                )

            function_node = FunctionNode(
                name=function_node_name,
                description=description,
                function=function,
                input_filter=input_filter,
                prefilled_params=prefilled_params,
            )

            function_nodes_dict[function_node_name] = function_node
            builder.add_function_node(function_node)

        # Process LLM routers (if defined in YAML)
        routers_config = aurora_config.get('routers', [])
        yaml_routers = {}  # Store routers created from YAML config

        for router_config in routers_config:
            router_name = router_config['name']
            router_type = router_config.get('type', 'smart')

            # Create LLM instance for router
            router_llm = None
            if 'model' in router_config:
                router_llm = cls._create_llm_from_config(
                    router_config['model'], base_llm, **kwargs
                )
            else:
                router_llm = base_llm  # Use base LLM if no specific model configured

            # Extract router-specific settings
            settings = router_config.get('settings', {})

            # Create router based on type
            if router_type == 'smart':
                routing_options = router_config.get('routing_options', {})
                if not routing_options:
                    raise ValueError(
                        f'Smart router {router_name} must specify routing_options'
                    )

                router_fn = create_llm_router(
                    router_type='smart',
                    routing_options=routing_options,
                    llm=router_llm,
                    **settings,
                )

            elif router_type == 'task_classifier':
                task_categories = router_config.get('task_categories', {})
                if not task_categories:
                    raise ValueError(
                        f'Task classifier router {router_name} must specify task_categories'
                    )

                router_fn = create_llm_router(
                    router_type='task_classifier',
                    task_categories=task_categories,
                    llm=router_llm,
                    **settings,
                )

            elif router_type == 'conversation_analysis':
                routing_logic = router_config.get('routing_logic', {})
                if not routing_logic:
                    raise ValueError(
                        f'Conversation analysis router {router_name} must specify routing_logic'
                    )

                router_fn = create_llm_router(
                    router_type='conversation_analysis',
                    routing_logic=routing_logic,
                    llm=router_llm,
                    **settings,
                )

            elif router_type == 'reflection':
                flow_pattern = router_config.get('flow_pattern', [])
                if not flow_pattern:
                    raise ValueError(
                        f'Reflection router {router_name} must specify flow_pattern'
                    )

                router_fn = create_llm_router(
                    router_type='reflection',
                    flow_pattern=flow_pattern,
                    llm=router_llm,
                    **settings,
                )

            elif router_type == 'plan_execute':
                agents = router_config.get('agents', {})
                if not agents:
                    raise ValueError(
                        f'Plan-Execute router {router_name} must specify agents'
                    )

                router_fn = create_llm_router(
                    router_type='plan_execute',
                    agents=agents,
                    llm=router_llm,
                    **settings,
                )
            else:
                raise ValueError(
                    f'Unknown router type: {router_type}. Supported types: smart, task_classifier, conversation_analysis, reflection, plan_execute'
                )

            yaml_routers[router_name] = router_fn

        # Merge YAML routers with provided routers
        all_routers = {}
        if routers:
            all_routers.update(routers)
        all_routers.update(yaml_routers)

        # Process auroraNodes (nested aurora workflows)
        aurora_nodes_config = aurora_config.get('auroras', [])
        aurora_nodes_dict = {}

        for aurora_node_config in aurora_nodes_config:
            node_name = aurora_node_config['name']
            inherit_vars = aurora_node_config.get('inherit_variables', True)

            # Method 1: External YAML file reference
            if 'yaml_file' in aurora_node_config:
                yaml_file_path = aurora_node_config['yaml_file']

                nested_builder = cls.from_yaml(
                    yaml_file=yaml_file_path,
                    memory=None,
                    agents=None,
                    routers=None,
                    base_llm=base_llm,
                    function_registry=None,
                    tool_registry=None,
                )
                nested_aurora = nested_builder.build()

            # Method 2: Inline definition
            else:
                # Build sub-config from inline definition
                sub_config = {
                    'aurora': {
                        'agents': aurora_node_config.get('agents', []),
                        'function_nodes': aurora_node_config.get('function_nodes', []),
                        'routers': aurora_node_config.get('routers', []),
                        'auroras': aurora_node_config.get(
                            'auroras', []
                        ),  # Support nesting!
                        'iterators': aurora_node_config.get('iterators', []),
                        'workflow': aurora_node_config['workflow'],
                    }
                }

                nested_builder = cls.from_yaml(
                    yaml_str=yaml.dump(sub_config),
                    memory=None,
                    agents=None,
                    routers=None,
                    base_llm=base_llm,
                    function_registry=None,
                    tool_registry=None,
                )
                nested_aurora = nested_builder.build()

            # Wrap in auroraNode
            aurora_node = auroraNode(
                name=node_name, aurora=nested_aurora, inherit_variables=inherit_vars
            )

            aurora_nodes_dict[node_name] = aurora_node
            builder._all_auroras.append(aurora_node)
            # Don't add to builder yet - will add during workflow processing if actually used

        # Process ForEachNodes (store configs, resolve later)
        foreach_nodes_config = aurora_config.get('iterators', [])
        foreach_nodes_dict = {}

        for foreach_config in foreach_nodes_config:
            foreach_name = foreach_config['name']
            execute_node_name = foreach_config['execute_node']

            foreach_nodes_dict[foreach_name] = {
                'name': foreach_name,
                'execute_node_name': execute_node_name,
            }

        # Resolve ForEachNode references now that all nodes exist
        for foreach_name, foreach_config in foreach_nodes_dict.items():
            execute_node_name = foreach_config['execute_node_name']

            # Find execute_node from ALL node types
            execute_node = (
                agents_dict.get(execute_node_name)
                or function_nodes_dict.get(execute_node_name)
                or aurora_nodes_dict.get(execute_node_name)
                or foreach_nodes_dict.get(execute_node_name)
            )

            if not execute_node:
                all_nodes = (
                    list(agents_dict.keys())
                    + list(function_nodes_dict.keys())
                    + list(aurora_nodes_dict.keys())
                    + list(foreach_nodes_dict.keys())
                )
                raise ValueError(
                    f"ForEachNode '{foreach_name}': execute_node '{execute_node_name}' not found. "
                    f'Available nodes: {all_nodes}'
                )

            # Create ForEachNode
            foreach_node = ForEachNode(name=foreach_name, execute_node=execute_node)

            foreach_nodes_dict[foreach_name] = foreach_node
            builder._foreach_nodes.append(foreach_node)

        # Process workflow
        workflow_config = aurora_config.get('workflow', {})

        # Helper function to find node from all sources
        def _find_node(node_name: str):
            return (
                agents_dict.get(node_name)
                or function_nodes_dict.get(node_name)
                or aurora_nodes_dict.get(node_name)
                or foreach_nodes_dict.get(node_name)
            )

        # Set start node
        start_node_name = workflow_config.get('start')
        if not start_node_name:
            raise ValueError('Workflow must specify a start node')

        start_node = _find_node(start_node_name)
        if not start_node:
            all_available = (
                list(agents_dict.keys())
                + list(function_nodes_dict.keys())
                + list(aurora_nodes_dict.keys())
                + list(foreach_nodes_dict.keys())
            )
            raise ValueError(
                f'Start node {start_node_name} not found. Available nodes: {all_available}'
            )

        # Add auroraNode to builder if it's used in main workflow
        if isinstance(start_node, auroraNode):
            builder._auroras.append(start_node)

        builder.start_with(start_node)

        # Process edges
        edges_config = workflow_config.get('edges', [])

        for edge_config in edges_config:
            from_node_name = edge_config['from']
            to_nodes_names = edge_config['to']
            router_name = edge_config.get('router')

            # Find from node
            from_node = _find_node(from_node_name)
            if not from_node:
                raise ValueError(f'From node {from_node_name} not found')

            # Add auroraNode to builder if it's used in main workflow and not already added
            if isinstance(from_node, auroraNode) and from_node not in builder._auroras:
                builder._auroras.append(from_node)

            # Find to nodes (handle special 'end' case)
            to_nodes = []
            for to_node_name in to_nodes_names:
                if to_node_name == 'end':
                    # 'end' will be handled in end nodes processing
                    continue

                to_node = _find_node(to_node_name)
                if not to_node:
                    raise ValueError(f'To node {to_node_name} not found')

                # Add auroraNode to builder if it's used in main workflow and not already added
                if isinstance(to_node, auroraNode) and to_node not in builder._auroras:
                    builder._auroras.append(to_node)

                to_nodes.append(to_node)

            # Find router function
            router_fn = None
            if router_name:
                if all_routers and router_name in all_routers:
                    router_fn = all_routers[router_name]
                else:
                    raise ValueError(
                        f'Router {router_name} not found. '
                        f'Available routers: {list(all_routers.keys()) if all_routers else []}'
                    )

            # Add edge (only if there are actual to_nodes, not just 'end')
            if to_nodes:
                builder.add_edge(from_node, to_nodes, router_fn)

        # Set end nodes
        end_nodes_names = workflow_config.get('end', [])
        if not end_nodes_names:
            raise ValueError('Workflow must specify end nodes')

        for end_node_name in end_nodes_names:
            end_node = _find_node(end_node_name)
            if not end_node:
                raise ValueError(f'End node {end_node_name} not found')

            # Add auroraNode to builder if it's used in main workflow and not already added
            if isinstance(end_node, auroraNode) and end_node not in builder._auroras:
                builder._auroras.append(end_node)

            builder.end_with(end_node)

        return builder

    @staticmethod
    def _create_llm_from_config(
        model_config: Dict[str, Any],
        base_llm: Optional[BaseLLM] = None,
        **kwargs,
    ) -> BaseLLM:
        """Create an LLM instance from model configuration.

        Args:
            model_config: Dictionary containing model configuration
            base_llm: Base LLM to use as fallback

        Returns:
            BaseLLM: Configured LLM instance
        """
        from aurora_ai.helpers.llm_factory import create_llm_from_config

        return create_llm_from_config(model_config, **kwargs)

    @staticmethod
    def _create_agent_from_direct_config(
        agent_config: Dict[str, Any],
        base_llm: Optional[BaseLLM] = None,
        available_tools: Optional[Dict[str, Tool]] = None,
        **kwargs,
    ) -> Agent:
        """Create an Agent from direct YAML configuration.

        Args:
            agent_config: Dictionary containing agent configuration
            base_llm: Base LLM to use if not specified in config
            available_tools: Available tools dictionary for tool lookup

        Returns:
            Agent: Configured agent instance
        """
        from aurora_ai.models.base_agent import ReasoningPattern
        # from aurora_ai.llm import OpenAI, Anthropic, Gemini, OllamaLLM

        # Extract basic configuration
        name = agent_config['name']
        job = agent_config['job']
        role = agent_config.get('role')

        # Configure LLM
        if 'model' in agent_config and base_llm is None:
            llm = auroraBuilder._create_llm_from_config(agent_config['model'], **kwargs)
        elif base_llm:
            llm = base_llm
        else:
            raise ValueError(
                f'Model must be specified for agent {name} or base_llm must be provided'
            )

        # Extract settings
        settings = agent_config.get('settings', {})
        temperature = settings.get('temperature')
        max_retries = settings.get('max_retries', 3)
        reasoning_pattern_str = settings.get('reasoning_pattern', 'DIRECT')

        # Convert reasoning pattern string to enum
        try:
            reasoning_pattern = ReasoningPattern[reasoning_pattern_str.upper()]
        except KeyError:
            raise ValueError(f'Invalid reasoning pattern: {reasoning_pattern_str}')

        # Set LLM temperature if specified
        if temperature is not None:
            llm.temperature = temperature

        # Extract and resolve tools
        agent_tools = []
        tool_names = agent_config.get('tools', [])
        if tool_names and available_tools:
            for tool_name in tool_names:
                if tool_name in available_tools:
                    agent_tools.append(available_tools[tool_name])
                else:
                    raise ValueError(
                        f'Tool {tool_name} for agent {name} not found in available tools. '
                        f'Available: {list(available_tools.keys())}'
                    )

        # Handle parser configuration if present
        output_schema = None
        if 'parser' in agent_config:
            from aurora_ai.formatter.yaml_format_parser import FloYamlParser

            # Convert agent_config to the format expected by FloYamlParser
            parser_config = {'agent': {'parser': agent_config['parser']}}
            parser = FloYamlParser.create(yaml_dict=parser_config)
            output_schema = parser.get_format()

        agent = (
            AgentBuilder()
            .with_name(name)
            .with_prompt(job)
            .with_llm(llm)
            .with_tools(agent_tools)
            .with_retries(max_retries)
            .with_reasoning(reasoning_pattern)
            .with_output_schema(output_schema)
            .with_role(role)
            .build()
        )

        return agent


# Convenience function for creating a builder
def create_aurora() -> auroraBuilder:
    """Create a new auroraBuilder instance."""
    return auroraBuilder()
