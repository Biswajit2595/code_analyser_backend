const express=require("express")
const cors=require("cors")
const axios=require("axios")
const { Octokit } = require("@octokit/core")
const fetch=require("node-fetch")
const app=express()
require("dotenv").config()
app.use(cors())
app.use(express.json())
const PORT=process.env.PORT


const octokit=new Octokit({
    auth:process.env.GITHUB_TOKEN,
    request:{
        fetch:fetch,
    },
});


app.get("/",(req,res)=>{
    res.send("Code Converter,code Debugger,Code Quality Analysis")
})

app.post("/convert", async (req, res) => {
    const { code, language } = req.body;
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model:'gpt-3.5-turbo',
            messages:[
                { role:'system',content:`Analyse the given code and convert the code in ${language}\n${code}` },
                { role:'user',content:code ,}
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        res.status(200).send(response.data.choices[0].message.content);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ "error": error.message });
    }
});

app.post("/quality", async (req, res) => {
    const { code } = req.body;
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions",{
            model:'gpt-3.5-turbo',
            messages:[
                { role:'system',content:`act as experienced developer in different domain. your task is to check the quality of the code. Provide a comprehensive code quality assessment, rating each of these parameters from 1 to 10: Code Consistency, Code Performance, Code Documentation, Error Handling, Code Testability, Code Complexity, Code Duplication, and Code Readability. Summarize the overall assessment with higher ratings indicating better quality and lower ratings highlighting areas for improvement.` },
                { role:'user',content:code }
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        res.status(200).send(response.data.choices[0].message.content);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ "error": error.message });
    }
});

app.post("/debug", async (req, res) => {
    const { code } = req.body;
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions",{
            model:'gpt-3.5-turbo',
            messages:[
                { role:'system',content:`Act as an seasoned software developer, your responsibility is to identify and rectify any existing issues within the provided code. Subsequently, you are expected to furnish an enhanced version of the code. Please elucidate the specific problem that you encountered and elaborate on the precise steps taken to resolve it.` },
                { role:'user',content:code }
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        res.status(200).send(response.data.choices[0].message.content);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ "error": error.message });
    }
});

//github
app.post("/github",async(req,res)=>{
    const {owner,repo,filepath}=req.body;
    try {
        const response = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
                owner: owner,
                repo: repo,
                path: filepath,
                headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );
    
        const data = Buffer.from(response.data.content, "base64").toString(
            "utf-8"
        );
        res.status(200).send(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ "error": error.message });
    }
})


app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})
