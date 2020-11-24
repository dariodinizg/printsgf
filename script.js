// fs = require("fs")

function main(){
    const myfile = document.getElementById("myfile")
    // alert("Precisa mudar de cor quando o ponto substituido por outra cor.")
    // alert("Colocar título no histórico e melhorar a apresentação do header")
    // alert("Colocar uma assinatura e disclaimer")
    // alert("Arrumar números dos movimentos e rotação dos playPoints")
    let sgfFile

    myfile.addEventListener("change", (event) => {
        sgfFile = event.target.files[0]
        parseSgf(sgfFile).then(
            data => {
                // console.log(text)
                fillBoard(data)
            }
            )
        })
    }

async function parseSgf(sgfFile){
    
    let sgfRecord = {}
    let kifuObj = {}
    sgfFile = await sgfFile.text().then( data =>{
        let sgf_headerSplit = data.split(";", 2)
        let headerLength = sgf_headerSplit[0].length + sgf_headerSplit[1].length
        let sgf_gameSplit = data.slice(headerLength + 2)
        sgfRecord.header = data.slice(2, headerLength + 1)
        sgfRecord.moves = sgf_gameSplit.split(";")
        kifuObj.header = readSgfTableHeader(sgfRecord.header)
        kifuObj.moves =  readSgfMoves(sgfRecord.moves)
    })
    return kifuObj
}

function fillBoard(kifuObj){
    let moveHistory = []
    let previousMove 
    displayHeader(kifuObj.header)
    kifuObj.moves.forEach(move => {
        if(!moveHistory.includes(move.point)){
            moveHistory.push(move.point)
            playPoint = document.getElementById(`${move.point}`)
            if(move.color == "B"){
                playPoint.setAttribute("fill", "black")
                addTextNode(playPoint, move, true)
            }
            else{
                playPoint.setAttribute("fill", "white")
                playPoint.setAttribute("stroke-width", "0.3")
                addTextNode(playPoint, move)
            }
        }
        else{
            previousMove = moveHistory.indexOf(move.point)
            // let previousPlayPoint = document.getElementById(`${kifuObj.moves[previousMove].point}`)
            console.log(`Move ${move.number} on ${move.point}`)
            moveHistory.push(move.point)
            playPoint = document.getElementById(`${move.point}`)
            // if(move.color == "B"){
                // previousPlayPoint.setAttribute("fill", "black")
                // playPoint.setAttribute("fill", "black")
                // addTextNode(playPoint, move, true)
            // }
            // else{
                // previousPlayPoint.setAttribute("fill", "white")
                // playPoint.setAttribute("fill", "white")
                // playPoint.setAttribute("stroke-width", "0.3")
                // addTextNode(playPoint, move)
                
            // }
            
        } 
        
    });
    if(moveHistory.length > 0){
        displayMoveHistory(moveHistory)
    }
    clearEmptyPlayPoints(moveHistory)
    cleanPage()
}

function displayHeader(kifuObjHeader){
    let gameInfoElement = document.getElementById("gameInfo")
    gameInfoElement.style.columnCount = 6
    gameInfoElement.style.columnWidth = "65px"
    Object.keys(kifuObjHeader).forEach(key => {
        let item = document.createElement("p")
        let itemKey = document.createElement("span")
        itemKey.style.fontWeight = "bold"
        itemKey.appendChild(document.createTextNode(`${key}:`))
        let itemValue = document.createElement("span")
        itemValue.style.marginLeft = "3px"
        itemValue.appendChild(document.createTextNode(`${kifuObjHeader[key]}`))
        // info.appendChild(document.createTextNode(`${key}: ${kifuObjHeader[key]}`))
        item.appendChild(itemKey)
        item.appendChild(itemValue)
        gameInfoElement.appendChild(item)
        // gameInfoElement.appendChild(info)
    })
}

function displayMoveHistory(moveHistory){

    let colNumberOfItems = 30
    let moveDisplay = document.getElementById("moveDisplay")
    let list = document.createElement("ol")
    list.setAttribute("id", "moveHistory")
    moveHistory.forEach( move => {
        let listElement = document.createElement("li")
        listElement.setAttribute("id", `move${move}`)
        listElement.style.fontStyle = "italic"
        listElement.appendChild(document.createTextNode(move))
        list.appendChild(listElement)
    })
    // console.log(parseInt(moveHistory.length / colNumberOfItems) + 1)
    list.style.columnCount = `${parseInt(moveHistory.length / colNumberOfItems) + 1}`
    list.style.columnWidth = "55px"
    moveDisplay.appendChild(list)
}

function addTextNode(svgPlayPoint, playMove, black=false){
    let playPointRadius = svgPlayPoint.getAttribute("r")/2
    let xPosCorrection
    if(String(playMove.number).length === 2){
        xPosCorrection = 1.1
    }
    else if(String(playMove.number).length === 1){
        xPosCorrection = 0.5
    }
    else{
        xPosCorrection = 1.5
    }
    let xpos = Number(svgPlayPoint.getAttribute("cx")) - (playPointRadius * xPosCorrection)
    let ypos = Number(svgPlayPoint.getAttribute("cy")) + playPointRadius/2
    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", `${xpos}`)
    text.setAttribute("y", `${ypos}`)
    text.style.fontSize = "2.2pt"
    text.style.textJustify = "center"
    text.style.textAlign = "center"
    text.style.alignContent = "center"
    black? text.style.fill = "white" : text.style.fill = "black"
    let textContent = document.createTextNode(`${playMove.number}`);
    text.appendChild(textContent);
    document.getElementsByTagName("svg")[0].appendChild(text)
}

function readSgfTableHeader(sgfHeader){
    const headerRegx = {
        "gameEvent":        /EV\[([^\]]*)\]/,
        "size":             /SZ\[([^\]]*)\]/,
        "gameName":         /GN\[([^\]]*)\]/,
        "source":           /SO\[([^\]]*)\]/,
        "round":            /RO\[([^\]]*)\]/,
        "black":            /PB\[([^\]]*)\]/,
        "blackCountry":     /BC\[([^\]]*)\]/,
        "blackRank":        /BR\[([^\]]*)\]/,
        "white":            /PW\[([^\]]*)\]/,
        "whiteCountry":     /WC\[([^\]]*)\]/,
        "whiteRank":        /WR\[([^\]]*)\]/,
        "matchDuration":    /TM\[([^\]]*)\]/,
        "komi":             /KM\[([^\]]*)\]/,
        "gameResult":       /RE\[([^\]]*)\]/,
        "date":             /DT\[([^\]]*)\]/,
        "place":            /PC\[([^\]]*)\]/,
        "rules":            /RU\[([^\]]*)\]/
    }
    let parsedHeader = {
        "gameEvent":        getValue(sgfHeader, headerRegx.gameEvent),
        "size":            getValue(sgfHeader, headerRegx.size),
        "gameName":         getValue(sgfHeader, headerRegx.gameName),
        "source":          getValue(sgfHeader, headerRegx.source),
        "round":           getValue(sgfHeader, headerRegx.round),
        "black":           getValue(sgfHeader, headerRegx.black),
        "blackCountry":     getValue(sgfHeader, headerRegx.blackCountry),
        "blackRank":        getValue(sgfHeader, headerRegx.blackRank),
        "white":           getValue(sgfHeader, headerRegx.white),  
        "whiteCountry":     getValue(sgfHeader, headerRegx.whiteCountry),
        "whiteRank":        getValue(sgfHeader, headerRegx.whiteRank),
        "matchDuration":    getValue(sgfHeader, headerRegx.matchDuration),
        "komi":            getValue(sgfHeader, headerRegx.komi),
        "gameResult":       getValue(sgfHeader, headerRegx.gameResult),
        "date":            getValue(sgfHeader, headerRegx.date),
        "place":        getValue(sgfHeader, headerRegx.place),
        "rules":           getValue(sgfHeader, headerRegx.rules),

    }
    let header2 = {
        "Date":         parsedHeader.date,         
        "Game Event":   `${parsedHeader.gameEvent}, round ${parsedHeader.round}`,
        "Game Name":    parsedHeader.gameName,
        "Size":         parsedHeader.size,         
        "Black":        `${parsedHeader.black + " - " + parsedHeader.blackRank + " - " + parsedHeader.blackCountry}`,
        "White":        `${parsedHeader.white + " - " + parsedHeader.whiteRank + " - " + parsedHeader.whiteCountry}`,
        "Match Duration": parsedHeader.matchDuration,
        "Komi":         parsedHeader.komi,         
        "Rules":        parsedHeader.rules,         
        "Game Result":    parsedHeader.gameResult,
        "Location":     parsedHeader.place,         
        "sgfSource":       parsedHeader.source,         
    }

    return header2
}

function getValue(sgfHeader, value){
    try{
        return value.exec(sgfHeader)[1]
    }
    catch{
        return ""
    }
}

function clearEmptyPlayPoints(moveHistory){
    let playPointsElements = document.getElementsByClassName("playPoints")
    for(let i = 0; i < playPointsElements.length; i++){
        let playPoint = playPointsElements[i]
        if(!moveHistory.includes(playPoint.getAttribute("id"))){
            playPoint.setAttribute("fill", "none")
            playPoint.setAttribute("stroke-width", "0")
        }
    }
}

function cleanPage(){
    let headerElement = document.getElementById("header")
    let footerElement = document.getElementById("footer")
    let gamePage = document.getElementById("gamePage")
    gamePage.style.backgroundImage = "none"
    headerElement.remove()
    footerElement.remove()
}

function readSgfMoves(sgfMoves){
    let moves = []
    for(let i = 0; i < sgfMoves.length; i ++){
        moves.push(
            {
                number:i + 1,
                color: sgfMoves[i][0],
                // letterPoint:/\[([^\]]*)\]/.exec(sgfMoves[i])[1],
                point: convertToCardinal(/\[([^\]]*)\]/.exec(sgfMoves[i])[1])
            }
        )
    }
    // console.log(moves[70])
    return moves
}

function convertToCardinal(coordinates){
    let letters = 'abcdefghijklmnopqrs'
    return (letters.indexOf(coordinates[1]) + 1) + coordinates[0]
}

