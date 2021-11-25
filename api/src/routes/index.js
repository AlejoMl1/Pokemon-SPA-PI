const { Router } = require('express');

const axios = require ('axios');
const router = Router();
const {Pokemon,Types} = require ('../db')


insertTypesToDB = async () =>{
    //require all the types of the API
    let allTypes = await getAllTypesApi()
    //Loop every type in the array and if that type doesnt exist in the database, create it
    allTypes.forEach(element => {
        Types.findOrCreate({
                where:{name:element.name}
        })
    });
}
async function createPokemon(id,name,type,image){

    let pokemonCreated = await Pokemon.create({
        id,
        name,
        image
    })
      //return all the temperaments that match with the ones the post give us
    let TypesDB = await Types.findAll({
        where: {name:type}
    })
        pokemonCreated.addTypes(TypesDB)
}

async function fetchPokemon(link) {
    try {
        const apiUrl= await axios.get(link)
        const apiInfo = await  Promise.all(apiUrl.data.results.map(async element => {
        const {name,url}= element;
        const {data: {id,sprites,types}} = await axios.get(url)
        return {
            name,
            id,
            image:sprites.other.home.front_default,
            types: types.map(type => {return type.type.name }  )
        }}))
        return apiInfo
    } catch (error) {
        console.log('error in fecthPokemon')
        console.error(error.message);
    }
}

//return the names in the API and creates the pokemons in the DB
const getDataPokemonApi = async () =>{
    try {
        //fetch the first 20 pokemons
        let link = 'https://pokeapi.co/api/v2/pokemon'
        let apiInfoFirst20 = await fetchPokemon(link)
        //fetch 20 pokemons more
        let link2="https://pokeapi.co/api/v2/pokemon?offset=20&limit=20"
        let apiInfoLast20 = await fetchPokemon(link2)

        let apiInfo = apiInfoFirst20.concat(apiInfoLast20)
        //with all the names , insert them into the database
   
         return apiInfo;

    } catch (error) {
        console.log('error in getDataPokemonApi')
        console.error(error.message);
    }
}
const getAllTypesApi = async () =>{
    try {
     
        const apiUrl= await axios.get('https://pokeapi.co/api/v2/type')
        const apiInfo = await apiUrl.data.results.map(element => {
            return {   
                name: element.name
            }
        })

        return apiInfo;

    } catch (error) {
        console.log('errorrrr')
        console.error(error.message);
    }
}

const getDbInfo = async()=>{
    return await Pokemon.findAll({
        include:{
            model: Types,
            //I dont put the id because the function will return automatically
            attributes:['name'],
            through:{
                attributes:[ ],
            },
        }
    })
}
//return the pokemons of the api and the db
const getAllPokemons = async ()=>{
    const apiInfo = await getDataPokemonApi();
    // await getDataPokemonApi();
    const dbInfo = await getDbInfo();

    //*here 
    const infoTotal = apiInfo.concat(dbInfo);

    return infoTotal;
    // return dbInfo;
}

router.get('/test',async (req,res,next)=>{
    Pokemon.findOrCreate({
        where:{name:"hola"}
    })
    res.send('sip')
})


router.get('/pokemons',async (req,res,next)=>{
    const name = req.query.name 
    //insert the types in the db  
    await insertTypesToDB()
    //return all the pokemons
    let allPokemonNames = await getAllPokemons()
    if(name){
        let nameMatch = await allPokemonNames.filter(element =>{
            //Transform the name to lowercase , both the one that comes from API and 
            // DB and the one that the user put as query parameter
            return element.name.toLowerCase()=== name.toLowerCase()
            // return element.name.toLowerCase().includes(name.toLowerCase()) 
        }
        )
        //if the nameMatch exists
        if (nameMatch.length){
            res.status(200).send(nameMatch)
        }else{
            console.log(nameMatch);
            res.status(404).send(`Pokemon ${name} not found!`)
        }
    //If there is no query parameter return all the names
    }else{
        res.status(200).send(allPokemonNames)
    }
    
})
//Function that inserts all the types of the API into the DB

router.get('/types',async (req,res)=>{
    try {
      
        //return the data that is save in the DB
        const alltypesDB = await Types.findAll();
        res.status(200).send(alltypesDB)
        
    } catch (error) {
        console.log('Error in the route TYPES')
        console.error(error)
        res.status(500).send('Data not found!')
    }
}
)

router.get('/pokemons/:id',async (req,res)=>{
    const id = req.params.id;
    //this is the same
    // const {id} =req.params;
    if(id){

        const allPokemon = await getAllPokemons();
        var requestPokemon = await allPokemon.filter(element => {
            // console.log(element.id);
            return element.id == id
        });
        requestPokemon?
        res.status(200).send(requestPokemon):
        res.status(404).send('There is no Pokemon with that id')
    }
});

router.post('/pokemons',async (req,res)=>{
    
    try {
        const { id,name,type,image} = req.body;
        createPokemon(id,name,type,image);
        res.send('Pokemon created')
        
    } catch (error) {
        
        res.status(404).send('Pokemon could not be created')
    }

})


module.exports = router;
// module.exports = insertTypesToDB;