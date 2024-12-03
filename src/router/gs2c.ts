import express from "express";
 
 


const gs2c = express.Router();

export const commonHeader = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.8",
    "cache-control": "no-cache",
    "origin":"https://ru88ebgdpm.qudxdfac.biz",
    "authority":"ru88ebgdpm.qudxdfac.biz",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
 
}
export const baseURL = 'https://ru88ebgdpm.qudxdfac.biz'
export const serverBase = "http://localhost:3008"
gs2c.all('/',async (req,res)=>{
    
    res.render('gs2c', { mgckey:req.query["mgckey"]});
})
gs2c.all('/session/verify',async (req, res)=>{
        
        console.log(`====== ${req.method} =====`)
        console.log(">>>>>>>>", req.body)
        
        console.log(">>>>>>>>", req.headers)

    res.status(200).send(true)
})
gs2c.post("/ge/v3/gameService", async (req, res)=>{
    try {
        
        const urlEncodedData:any = Object.keys(req.body)
            .map((key:any) => encodeURIComponent(key) + '=' + encodeURIComponent(req.body[key]))
            .join('&');
        
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "POST",
            body:urlEncodedData ,
            headers:{
                ...commonHeader,
            "content-type": "application/x-www-form-urlencoded",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || ""
          
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        console.log(data)
        res.set("Content-Type", "text/html;charset=UTF-8");
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})


gs2c.get("/announcements/unread/", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/x-www-form-urlencoded",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        res.set("Content-Type", "text/html;charset=UTF-8");
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})

gs2c.post("/saveSettings.do", async (req, res)=>{
    try {
        
        const urlEncodedData:any = Object.keys(req.body)
        .map((key:any) => encodeURIComponent(key) + '=' + encodeURIComponent(req.body[key]))
        .join('&');
        console.log(urlEncodedData)
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "POST",
            body:urlEncodedData,
            headers:{
                ...commonHeader,
            "content-type": "application/x-www-form-urlencoded",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        res.set("Content-Type", "application/x-www-form-urlencoded");
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
 

gs2c.get("/promo/active/", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/json",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
gs2c.get("/promo/race/details", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/json",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
gs2c.get("/promo/race/prizes", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/json",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
gs2c.get("/promo/frb/available", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/json",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
gs2c.post("/promo/tournament/player/choice/OPTIN/", async (req, res)=>{
    try {
        
 
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "POST",
            body: JSON.stringify(req.body),
            headers:{
                ...commonHeader,
         "content-type": "application/json",    
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
         
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
gs2c.post("/promo/race/player/choice/OPTIN/", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "POST",
            body: JSON.stringify(req.body),
            headers:{
                ...commonHeader,
         "content-type": "application/json",    
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
 

gs2c.get("/promo/tournament/details/", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/json",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})


gs2c.get("/promo/tournament/scores/", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            "content-type": "application/json",
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
      
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})
gs2c.get("/reloadBalance.do", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        res.set('content-type','text/html;charset=UTF-8')
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})

gs2c.options('/stats.do',async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "OPTIONS",
      
            headers:{
                ...commonHeader,
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        res.set('content-type','text/html;charset=UTF-8')
        res.status(204).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})


gs2c.get("/common/v1/games-html5/games/vs/vs20olympxmas/desktop/customizations.info", async (req, res)=>{
    try {
        
   
          
        const response = await fetch(`${baseURL}${req.originalUrl}`,{
            "method": "GET",
      
            headers:{
                ...commonHeader,
            referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
                "cookie": req.headers?.cookie || ""
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        res.set('content-type','text/html;charset=UTF-8')
        res.status(200).send(data)
    } catch (error) {
            console.log( `${req.path} error:`,error)

            res.status(400).send(error)
    }
})



// gs2c.get("/common/v5/games-html5/games/vs/vs20olympxmas/desktop/build.js", async (req, res)=>{
//     try {
        
   
          
//         const response = await fetch(`${baseURL}${req.originalUrl}`,{
//             "method": "GET",
      
//             headers:{
//                 ...commonHeader,
//             referer: req.headers.referer?.replace(`${serverBase}/gs2c/`,`${baseURL}/gs2c/html5Game.do`) || "",
//                 "cookie": req.headers?.cookie || ""
//             }
//         })

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.text();
//         res.set('content-type','text/html;charset=UTF-8')
//         res.status(200).send(data)
//     } catch (error) {
//             console.log( `${req.path} error:`,error)

//             res.status(400).send(error)
//     }
// })

    


export {
     gs2c
}