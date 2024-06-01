
const REQUIRED_FIELDS = [ 
    {
        label: "Κατηγορία",
        value: "MTRCATEGORY"
    },
    {
        label: "Ομάδα",
        value: "MTRGROUP"
    },
    {
        label: "Υποομάδα",
        value: "CCCSBUBGROUP2"
    },
    // {
    //     label: "Κωδικός Εργοστασίου",
    //     value: "CODE2"
    // },
    // {
    //     label: "Κωδικός ERP",
    //     value: "CODE"
    // },
]

export default async function handler(req, res) {
  
    if(req.method !== "POST") {
        return res.status(405).json({message: "Method not allowed"})
    }

    let response = {}
        const {data } = req.body
        console.log(data)
        try {
            const MISSING_FIELDS = REQUIRED_FIELDS.filter(field => !data[field.value])
            console.log(MISSING_FIELDS)
            if(MISSING_FIELDS.length) {
                response.message = `Λείπουν Υποχρεωτικά Πεδία. Προχωρήστε σε Τροποποίηση`
                response.status = false
                return res.status(200).json(response)
            } else {
                response.message = "Το προϊόν προστέθηκε επιτυχώς στο SoftOne"
                response.status = true
                return res.status(200).json(response)
            }
        } catch (e) {
            console.log(e.message)
            response.message = e.message
            response.success = false
            return res.status(500).json(response)
        }

}