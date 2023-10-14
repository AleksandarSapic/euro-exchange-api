const PORT = process.env.PORT || 8000   //Port preko kog server komunicira
const express = require('express')
const axios = require('axios')          //Ubacivanje datih paketa kako bi mogli da se koriste
const cheerio = require('cheerio')
const app = express()

const valute = []                       //Niz naziva svih valuta i njihov odnos prema EUR

axios.get('https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html').then((response) => {
    const html = response.data
    const $ = cheerio.load(html)                                        /** Uzima podatke sa sajta Evropske Centralne banke **/
    $('tbody > tr', html).each(function () {
        const skracenNaziv = $(this).find('td.currency').attr('id')     /** I izvlaci odnos EUR prema svim valutama koje banka objavljuje **/
        const imeValute = $(this).find('td.alignLeft > a').text()
        const odnosValute = $(this).find('td.number > a > span').text()
        valute.push({                                                   /** Zatim izvucene podatke smesta u promenljivu valute **/
            skracenNaziv,
            imeValute,
            odnosValute
        })
    })
}).catch((err) => console.log(err))

app.get('/', (req, res) => {
    res.json('Dobro dosli na API za proveru odnosa evra prema drugim valutama')
})

app.get('/euro', (req, res) => { /** Na zahtev korisnika vraca trenutni odnos svih valuta prema EUR **/
    res.json(valute)
})

app.get('/:valutaId', (req, res) => { /** Na zahtev korisnika vraca trenutni odnos samo odredjene valute prema EUR, primer: /usd **/
    const IdValute = req.params.valutaId
    const specificnaValuta = valute.find(function (valuta, index) {
        if (valuta.skracenNaziv == IdValute.toUpperCase())
            return true
    })
    if (specificnaValuta == null)
        res.json("We don't have value for the specific currency, may you check if it is correct request")
    else
        res.json(specificnaValuta)
})

app.listen(PORT, () => console.log('Server se pokrece na portu ' + PORT))