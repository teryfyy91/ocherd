import os

def search_in_files(directory, search_str):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith(('.js', '.jsx', '.css', '.html', '.json')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        if search_str.lower() in f.read().lower():
                            print(f'Found "{search_str}" in {path}')
                except:
                    pass

search_in_files('c:/Users/AsrFayzi/Desktop/ocherd', 'Barber Shop')
