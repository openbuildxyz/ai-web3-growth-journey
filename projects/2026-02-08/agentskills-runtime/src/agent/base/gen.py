import re
import os
import sys

from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from interaction.gen import extract_events

# For event handlers: NOT returning values & Without agent request
code_template_1_1 = '''
    static public func handle(event!: {struct_name}, forRequest!: Option<AgentRequest> = None): {return_type} {{
        if (let Some(request) <- forRequest) {{
            if (let Some(object) <- request.eventHandlerManager) {{
                (object as EventHandlerManager).getOrThrow().handle(event)
            }}
        }}
        if (let Some(object) <- event.agent.eventHandlerManager) {{
            (object as EventHandlerManager).getOrThrow().handle(event)
        }}
        EventHandlerManager.global.handle(event)
    }}
'''

# For event handlers: NOT returning values & With agent request
code_template_1_2 = '''
    static public func handle(event!: {struct_name}): {return_type} {{
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {{
            (object as EventHandlerManager).getOrThrow().handle(event)
        }}
        if (let Some(object) <- event.agent.eventHandlerManager) {{
            (object as EventHandlerManager).getOrThrow().handle(event)
        }}
        EventHandlerManager.global.handle(event)
    }}
'''

# For event handlers: returning values & Without agent request
code_template_2_1 = '''
    static public func handle(event!: {struct_name}, forRequest!: Option<AgentRequest> = None): EventResponse<{return_type}> {{
        if (let Some(request) <- forRequest) {{
            if (let Some(object) <- request.eventHandlerManager) {{
                match ((object as EventHandlerManager).getOrThrow().handle(event)) {{
                    case Continue => ()
                    case Continue(v) => return Continue(v)
                    case Terminate(v) => return Terminate(v)
                }}
            }}
        }}

        if (let Some(object) <- event.agent.eventHandlerManager) {{
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {{
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }}
        }}

        match (EventHandlerManager.global.handle(event)) {{
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }}
        return Continue
    }}
'''

# For event handlers: returning values & With agent request
code_template_2_2 = '''
    static public func handle(event!: {struct_name}): EventResponse<{return_type}> {{
        if (let Some(object) <- event.agentRequest.eventHandlerManager) {{
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {{
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }}
        }}

        if (let Some(object) <- event.agent.eventHandlerManager) {{
            match ((object as EventHandlerManager).getOrThrow().handle(event)) {{
                case Continue => ()
                case Continue(v) => return Continue(v)
                case Terminate(v) => return Terminate(v)
            }}
        }}

        match (EventHandlerManager.global.handle(event)) {{
            case Continue => ()
            case Continue(v) => return Continue(v)
            case Terminate(v) => return Terminate(v)
        }}
        return Continue
    }}
'''

def generate_code(events):
    """Generate the EventHandlerManager code for the given struct names.
    Args:
        events (list): List of struct names to generate handlers for
    Returns:
        str: The generated code
    """
    code = []

    # Generate private fields and methods for each struct
    for event in events:
        # Add handle method
        args = {
            "struct_name": event.name,
            "return_type": event.return_type
        }
        if event.return_type == "Unit":
            if 'AgentRequest' not in event.members:
                code.append(code_template_1_1.format(**args))
            else:
                code.append(code_template_1_2.format(**args))
        else:
            if 'AgentRequest' not in event.members:
                code.append(code_template_2_1.format(**args))
            else:
                code.append(code_template_2_2.format(**args))

    return ''.join(code)

def replace_content_between_markers(file_path, start_marker, end_marker, new_content):
    """
    Replaces all content between two marker lines in a file with new content.
    Args:
        file_path (str): Path to the target file
        start_marker (str): Starting line marker (partial match supported)
        end_marker (str): Ending line marker (partial match supported)
        new_content (str/list): Content to insert between markers (string or list of lines)

    Returns:
        bool: True if successful, False if markers not found or error occurred
    """
    try:
        # Read the original file
        with open(file_path, 'r') as file:
            lines = file.readlines()

        start_idx = -1
        end_idx = -1

        # Find the start and end markers
        for i, line in enumerate(lines):
            if start_marker in line and start_idx == -1:
                start_idx = i
            if end_marker in line and start_idx != -1 and i > start_idx:
                end_idx = i
                break

        # Validate markers were found
        if start_idx == -1 or end_idx == -1:
            if start_idx == -1:
                print(f"Start marker not found: '{start_marker}'")
            if end_idx == -1 and start_idx != -1:
                print(f"End marker not found after start marker: '{end_marker}'")
            return False

        # Replace content between markers
        modified_lines = lines[:start_idx + 1] + [new_content] + lines[end_idx:]

        # Write back to file
        with open(file_path, 'w') as file:
            file.writelines(modified_lines)

        return True

    except Exception as e:
        print(f"Operation failed: {str(e)}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Input and output file paths
    input_file = os.path.join(script_dir, "../../interaction/events.cj")
    output_file = os.path.join(script_dir, "./agent_op.cj")

    # Extract struct names
    events = extract_events(input_file)

    # Generate handler code
    code = generate_code(events)

    # Write to output file
    replace_content_between_markers(
        output_file,
        '// The following are event handlers:',
        '// end of event handlers',
        code
    )

if __name__ == "__main__":
    main()
