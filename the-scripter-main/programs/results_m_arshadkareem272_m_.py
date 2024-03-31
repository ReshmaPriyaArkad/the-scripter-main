
import requests
from bs4 import BeautifulSoup
from time import sleep
import time
from plyer import notification 
i = 0


while True:
  URL = "http://siddharthgroup.ac.in/aut4btech1regr19nov2022.php?title=&dbn=aut4btech1r19nov2022&htno=19F61A0508&submit=Get+Results"
  r = requests.get(URL)
  i += 1
  soup = BeautifulSoup(r.content, 'html5lib')
  # print(soup.prettify())
  if ("404 - File or directory not found." not in soup.prettify()):
    print("Found")
    sleep(3)
    notification.notify(title = "Results are out!!!", message=" 4-2 results are out now", timeout=2)
    time.sleep(7)
    break
  sleep(10)