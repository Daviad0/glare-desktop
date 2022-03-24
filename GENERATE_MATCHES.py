import requests

path = input("Please enter the event code: ")
year = input("Please enter the year: ")
file = input("Please enter a relative file path: ")

url = 'https://www.thebluealliance.com/api/v3/event/' + year + path + "/matches/simple"

head = {'X-TBA-Auth-Key': 'kzyt55ci5iHn3X1T8BgXYu2yMXmAjdxV5OCXHVA16CRfX8C0Z6tfrwU4BajyleY3', 'User-Agent' : "Lightning Robotics", "accept" : "application/json"}

x = requests.get(url, headers = head)
data = x.json()

j = 0

matches = {}

for i in data:
    if(i["comp_level"] != "qm"):
        continue
    rt = i["alliances"]["red"]["team_keys"]
    bt = i["alliances"]["blue"]["team_keys"]
    matches[i["match_number"]] = [rt[0], rt[1], rt[2], bt[0], bt[1], bt[2]]
    j+=1

finalstring = ""
    
for i in range(j):
    print("Match", i, "successfully loaded")
    for t in matches[i+1]:
        finalstring += t[3:] + ","
    finalstring = finalstring[:-1] + "\n"

print(finalstring)

f = open(file, "w")
f.write(finalstring)
f.close()

    
    
