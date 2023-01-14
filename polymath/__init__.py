from polymath.library import Library
from polymath.ask_embeddings import (
    LIBRARY_DIR,
    get_embedding,
    load_libraries,
    get_token_count,
    get_context_for_library,  # TODO: factor this into client
    get_chunk_infos_for_library,  # TODO: factor this into client
    get_completion,
    get_completion_with_context,  # TODO: factor this into client
    ask
)