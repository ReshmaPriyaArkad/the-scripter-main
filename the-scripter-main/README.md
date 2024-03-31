# The Scripter

Scripter is a Cloud based code execution platform, which supports background execution of programs upto 2 months.

## Download Source Code
If you have already Git installed on your machine you can run this command for downloading this project.
```bash
git clone https://github.com/Arshad272/the-scripter.git
```
```or``` 
Download zip file and unzip it for usage.


## Installation

First step is installation of Node.JS [Download](https://nodejs.org/en) to install Node.

Next XAMPP software is required for connecting to MySQL Databsae [Download](https://www.apachefriends.org/download.html) Xampp here.

For installation of required node modules type the below command in terminal. Note: You should run the below command in the location where (package.json) file is located. 

```bash
npm install
```

In XAMPP ceate a new database named ```scripter``` 
Inside this database import ```scripter.sql``` file which is present in DB folder.

## Usage

For execution of code, enter the below command in terminal. Note: ou should run the below command in the location where (index.js) file is located. 

```bash
pm2 -start index.js
```

## Develped By

Mr. K Arshad

[Developer Contact](https://arshad272.github.io/)