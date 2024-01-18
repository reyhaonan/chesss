[Session]
<!-- White player identification -->
White uuid 
<!-- Black player identification -->
Black uuid
<!-- current state of the board -->
whiteRemainingTime date
<!-- remaining time for black -->
blackRemainingTime date
<!-- fen string summary for quick board translation -->
fenstring string

gameState enum["1-0","0-1","0-0"]
boardHistory []



```
() => {
		if(interval)clearInterval(interval)
		now = new Date()
		countdown = new Date()
		countdown.setTime(countdown.getTime() + 30 * 1000)
		interval = setInterval(() => {
			now = new Date()
			if(countdown <= now){
				clearInterval(interval)
				alert("YOU LOSE")
				now = null
				countdown = null
				interval = null
			}
		},1)
	}
```