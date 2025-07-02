import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# 크롤링 대상 URL (예시: 사업공고)
BIZ_URL = "https://www.mss.go.kr/site/smba/ex/bbs/List.do?cbIdx=310"  # 첨부 이미지 기준 사업공고 게시판

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

DETAIL_URL = "https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx={cbIdx}&bcIdx={bcIdx}"

# 게시글 목록에서 최근 1주일 이내 글만 추출 (공지/번호/빈행 제외, 날짜포맷 보정)
def fetch_recent_posts(url, days=7):
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get(url)
    time.sleep(2)  # 페이지 로딩 대기
    with open('debug_biz.html', 'w', encoding='utf-8') as f:
        f.write(driver.page_source)
    posts = []
    today = datetime.now()
    week_ago = today - timedelta(days=days)
    rows = driver.find_elements(By.CSS_SELECTOR, 'table.boardList tbody tr')
    for row in rows:
        try:
            onclick = row.get_attribute('onclick')
            m = re.search(r"doBbsFView\('([0-9]+)','([0-9]+)'", onclick)
            if not m:
                print('onclick 파싱 실패:', onclick)
                continue
            cbIdx, bcIdx = m.group(1), m.group(2)
            # 제목
            title_tag = row.find_element(By.CSS_SELECTOR, 'td.subject a.pc-detail')
            title = title_tag.text.strip()
            # 등록일: 4번째 td
            tds = row.find_elements(By.TAG_NAME, 'td')
            if len(tds) < 5:
                print('td 개수 부족:', len(tds))
                continue
            date_str = tds[3].text.strip()
            try:
                post_date = datetime.strptime(date_str, '%Y.%m.%d')
            except Exception:
                print('날짜 파싱 실패:', date_str)
                continue
            if week_ago <= post_date <= today:
                post_url = DETAIL_URL.format(cbIdx=cbIdx, bcIdx=bcIdx)
                posts.append({
                    'title': title,
                    'url': post_url,
                    'date': date_str
                })
        except Exception as e:
            print('row 처리 중 오류:', e)
            continue
    print(f'최종 추출: {len(posts)}건')
    driver.quit()
    return posts

def crawl_and_save():
    bizs = fetch_recent_posts(BIZ_URL)
    result = {
        'bizs': bizs
    }
    with open('recent_posts.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"{len(bizs)}건의 사업공고를 저장했습니다.")

if __name__ == '__main__':
    crawl_and_save()
