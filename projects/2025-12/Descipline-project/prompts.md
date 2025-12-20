# prompts

## 1

i need to develop an crypto trading learning app. app should consist of two modules:

* community module based on DAO (rewards/penalties based on solidity EVM)
* learning module to improve trading skills
The learning module will provide free lessons. After each lesson there is an assignment, which will consist of questions about the material and answers will be evaluated by AI (Gemini Flash 3). The results should be pushed to the chain based on solidity. To ensure continuous learning a community module based on DAO is introduced, there should be a pool each day in which real money is stored. The pool is distributed based on assignment resutls.

## 2

Following modifications need to be done:

* the lessons should be bundled in a lesson plan
* add optional paid lessons, for which can be paid for by using the x402 http protocol and metamask wallet
* remove user claiming the rewards, change the contract to send the reward directly to the wallet, show in ui the recieved reward only
* change the Smart Distribution reward formula: the reward is paid out after you finished the lesson plan and is paid to the user with maximum score
* add admin interface to add new lessons
* add user signup and login interface (signup should be asking for username)

## 3

adjust following:

* app name is DESCIPLINE
* the lessons plans have no completion rewards, but users when they join a lesson plan can contribute to the lesson plan pool (usually couple of dollars)
* change the interactive ui: on click on each lesson there should open a new window with the lesson. 
* also the ui now is missing the assignment ui, should be put back
* the admin ui should be changed, each lesson plan should have multiple lessons, each lesson should have title, price, duration, description and content inputs. for content input create a new button to generate content by AI by using the description input

## 3.1

Following changes needed:

* Lesson plan should have a start date and duration (in days)
* To join the lesson plan a contribution to the pool is mandatory (min. 1$ amount)
* Pool gets distributed immediatly after the lesson plan ends

## final

implement it now
