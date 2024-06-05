import axios from "axios";
let AccessKey = process.env.NEXT_PUBLIC_BUNNY_KEY;

const storageZoneName = 'kolleris'
const region = 'storage'
const path = 'images'
const headers = {
  AccessKey: AccessKey,
  'Content-Type': 'application/octet-stream',
}





export async function uploadBunny(data, fileName) {
    let result = await axios.put(`https://${region}.bunnycdn.com/${storageZoneName}/images/${fileName}`, data , { headers: headers })
    return result.data
}
export async function uploadBunnyFolderName(data, fileName, folderName) {
    let result = await axios.put(`https://${region}.bunnycdn.com/${storageZoneName}/${folderName}/${fileName}`, data , { headers: headers })
    return result.data
}

export async function deleteBunny(fileName) {
  console.log('bunny delete')
  let result = await axios.delete(`https://${region}.bunnycdn.com/${storageZoneName}/images/${fileName}`, { headers: {
    AccessKey: AccessKey
  } })
  console.log('bunny result')
  console.log(result)
  return result.data
 
}




