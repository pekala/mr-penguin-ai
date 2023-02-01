#!/usr/bin/env python@3.9

from bs4 import BeautifulSoup
import requests
import json

langs = ['en', 'da', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'fi', 'sv']
for lang in langs:
  articles = []

  root = 'https://help.pleo.io'
  root_result = requests.get(f'{root}/{lang}')
  root_content = root_result.text
  root_soup = BeautifulSoup(root_content, 'lxml')

  root_box = root_soup.find('section', class_='section')
  root_links = [
    collection_link['href']
    for collection_link in root_box.find_all('a', href=True)
  ]

  for root_link in root_links:
    collection_result = requests.get(f'{root}/{root_link}')
    colletion_content = collection_result.text
    collection_soup = BeautifulSoup(colletion_content, 'lxml')
    collection_box = collection_soup.find('div', class_='section__bg')
    collection_links = [
      link['href'] for link in collection_box.find_all('a', href=True)
    ]

    for collection_link in collection_links:
      result = requests.get(f'{root}/{collection_link}')
      content = result.text
      soup = BeautifulSoup(content, 'lxml')
      box = soup.find('div', class_='paper paper__large')
      title = box.find('h1').get_text()
      description = box.find('div',
                             class_='article__desc').get_text(strip=True,
                                                              separator=' ')
      transcript = box.find('article').get_text(strip=True, separator=' ')

      print(title)
      articles.append({
        'info': {
          'url': f'{root}/{collection_link}',
          'title': title,
          'description': description,
        },
        'text': transcript
      })

  with open(f'articles-{lang}.json', 'w') as file:
    file.write(json.dumps({"bits": articles}))
