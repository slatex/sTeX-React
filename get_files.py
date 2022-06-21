import requests
import json

projects = []
files = {}


def get_projects(group: str):
    url = f'https://gl.mathhub.info/groups/{group}/-/children.json'

    for i in range(1, 100):
        full_url = url + f'?page={i}'
        response = requests.get(full_url)
        if len(response.content) == 0:
            break
        data = response.json()

        if len(data) == 0:
            break
        for elem in data:

            name = elem['name']
            e_type = elem['type']
            if e_type == 'group':
                # pass
                get_projects(f'{group}/{name}')
            elif e_type == 'project':
                projects.append(f'{group}/{name}')


def get_files(project: str, location: str):
    url = f'https://gl.mathhub.info/{project}/-/refs/main/logs_tree/source/{location}?format=json&offset=0'
    print(url)
    response = requests.get(url)
    if len(response.content) == 0:
        return
    data = response.json()
    if len(data) == 0:
        return
    for elem in data:

        name = elem['file_name']
        e_type = elem['type']
        if e_type == 'tree':
            # pass
            get_files(project, f'{location}/{name}')
        elif e_type == 'blob' and name.endswith('.tex'):
            files[project].append(f'{location}/{name}')


if __name__ == "__main__":
    for group in ['smglom', 'MiKoMH', 'sTeX']:
        get_projects(group)
    for proj in projects:
        files[proj] = []
        get_files(proj, '')
    # print(files)
    with open('files.json', 'w') as outfile:
        json.dump(files, outfile)
