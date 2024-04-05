import { useState } from 'react'
import axios from 'axios'
import { removeAndMergeDuplicates, sortByKey, filterRule } from './helper'
import { baseUrl } from './config'

const option = {
  headers: {
    'Cache-Control': 'max-age=3600', // Cache the response for 1 hour (3600 seconds)
  }
}

function App() {
  const [urls, setUrls] = useState('')
  const [disableSubmit, setDisableSubmit] = useState(false)
  const [filter, setFilter] = useState({
    zeroXp: true,
    upgraded: true,
    guardian: true,
    seeker: true,
    survivor: true,
    mystic: true,
    rogue: true,
    neutral: true
  })
  const [finalList, setFinalList] = useState([])

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilter({
      ...filter,
      [name]: checked
    })
  };

  const onClick = async () => {
    setDisableSubmit(true)
    const urlsArray = urls.split('\n')
    let cardList = await getCards(), responseJson, slots, previous;
    cardList = cardList.filter(o => !(o.type_code === 'treachery' || o.type_code === 'investigator'))

    cardList = cardList.map(o => ({
      ...o,
      usedCount: 0,
    }))

    for (let i in urlsArray) {
      let url = urlsArray[i], slots = [], getData 
      if (url.includes('arkhamdb.com/decklist/')) {
        getData = getDeckList
      } else if (url.includes('arkhamdb.com/deck/')) {
        getData = getDeck
      }

      previous = url.split('/')[5]

      while (previous) {
        try {
          responseJson = await getData(previous)
          previous = responseJson.previous_deck;
          console.log('a', responseJson.slots['01092'])
          slots = [...slots,...Object.keys(responseJson.slots)]
        } catch (error) {
          console.error("Error fetching data:", error);
          break; 
        }
      }
      slots = new Set(slots);
      cardList = cardList.map(card => slots.has(card.code) ? {
        ...card,
        usedCount: card.usedCount + 1
      } : card)
    }
    cardList = removeAndMergeDuplicates(cardList, "name", "subname", "xp" ,"usedCount");
    setFinalList(sortByKey(cardList, 'usedCount'))
    setDisableSubmit(false)
  }

  const getCards = async () => {
    let response = await axios.get(`${baseUrl}/api/cards`, option)
    return response.data
  }

  const getDeck = async (id) => {
    // eg https://arkhamdb.com/deck/view/3665001
    let response = await axios.get(`${baseUrl}/api/deck/` + id, option);
    return response.data
  }

  const getDeckList = async (id) => {
    // eg https://arkhamdb.com/decklist/view/44268/parallel-roland-pimps-his-boomstick-a-hc-deck-1.0
    let response = await axios.get(`${baseUrl}/api/decklist/` + id, option);
    return response.data
  }

  return (
    <div className="App">
      <div>
        filter
        <div>
          <div>
            <input
              type="checkbox"
              name="zeroXp"
              checked={filter.zeroXp}
              onChange={handleCheckboxChange}
            />
            <label>0 xp</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="upgraded"
              checked={filter.upgraded}
              onChange={handleCheckboxChange}
            />
            <label>1-5 xp</label>
          </div>
        </div>
        <div>
          {
            ['guardian', 'seeker', 'survivor', 'mystic', 'rogue', 'neutral'].map(o =>
              <div>
                <input
                  type="checkbox"
                  name={o}
                  checked={filter[o]}
                  onChange={handleCheckboxChange}
                />
                <label>{o}</label>
              </div>)
          }
        </div>
      </div>
      <div>
        <textarea value={urls} onChange={(e) => setUrls(e.target.value)}></textarea>
      </div>
      <button disabled={disableSubmit} onClick={onClick}>Submit</button> {disableSubmit?'Loading, please wait':''}
      <table>
        <tbody>
          {finalList
            .filter(card => filterRule(card, filter))
            .map(o => <tr id={o.code}>
              <td>
                <a href={`https://arkhamdb.com/card/${o.code}`}>{o.name} ({o.xp}) {o.subname ? ` subtitle - ${o.subname}` : ''}</a>
              </td>
              <td>
                {o.usedCount}
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default App;
