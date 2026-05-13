import hashlib

def get_file_hash(file_content):
    """Genera un hash único basado en el contenido del archivo."""
    return hashlib.sha256(file_content).hexdigest()