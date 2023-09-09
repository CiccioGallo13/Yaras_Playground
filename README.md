# YARA's Playground
This is a web-application that will help you to write and test your YARA rules.

To use the app, you need to clone this repo (or download it), after that you can open the backend folder with you IDE and install the requirements.\
Python 3.10 or higher is required, and that you can install the requirements using pip:
```bash
pip install -r requirements.txt
```
Then you can run the server with:
```bash
python3 -m uvicorn main:app --reload
```
Once the server is running you can open the frontend folder, here you need to install the dependencies too.\
You can use npm:
```bash
npm install
```
Now you can run the app by the command:
```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
