import { expansions } from '@/lib/CardsDB'
import type { Card } from '@/types'
import type React from 'react'
import ReactDOM from 'react-dom'

interface CardModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

const CardModal: React.FC<CardModalProps> = ({ card, isOpen, onClose }) => {
  if (!isOpen || !card) return null

  const alternateVersions = card.alternate_versions.slice(1)
  const amountOwned = card.amount_owned || 0

  const getImageForVersion = (version: string) => {
    const id = version.split('#')[1]
    const expansionId = card.set_details.match(/\(([^)]+)\)/)?.[1]
    const expansion = expansions.find((exp) => exp.id === expansionId)
    if (!expansion) return ''
    const alternateCard = expansion.cards.find((c) => c.card_id === `${expansionId}-${id}`)
    return alternateCard ? alternateCard.image : ''
  }

  const modalContent = (
    <div className="modal" style={modalStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <span className="close" style={closeStyle} onClick={onClose}>
          &times;
        </span>
        <div style={modalBodyStyle}>
          <div style={imageContainerStyle}>
            <img id="cardImage" className="card-image" src={card.image} alt={card.name} style={cardImageStyle} />
          </div>
          <div style={detailsContainerStyle}>
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th style={tableHeaderStyle}>Number Owned</th>
                    <td style={tableCellStyle}>{amountOwned}</td>
                  </tr>
                  <tr>
                    <th style={tableHeaderStyle}>Rarity</th>
                    <td style={tableCellStyle}>{card.rarity}</td>
                  </tr>
                  <tr>
                    <th style={tableHeaderStyle}>Set</th>
                    <td style={tableCellStyle}>{card.set_details}</td>
                  </tr>
                  <tr>
                    <th style={tableHeaderStyle}>Pack</th>
                    <td style={tableCellStyle}>{card.pack}</td>
                  </tr>
                  <tr>
                    <th style={tableHeaderStyle}>Crafting Cost</th>
                    <td style={tableCellStyle}>{card.crafting_cost}</td>
                  </tr>
                  <tr>
                    <th style={tableHeaderStyle}>Artist</th>
                    <td style={tableCellStyle}>{card.artist}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={alternateCardsContainerStyle}>
              <h3 style={alternateCardsTitleStyle}>Alternative Cards</h3>
              <div style={alternateCardsWrapperStyle}>
                {alternateVersions.length > 0 ? (
                  alternateVersions.map((version, index) => (
                    <div key={index} style={alternateCardStyle}>
                      <img src={getImageForVersion(version.version)} alt={version.version} style={alternateVersionImageStyle} />
                      <div style={alternateCardDetailsStyle}>
                        <p>Version: {version.version}</p>
                        <p>Rarity: {version.rarity}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No Alternatives in Set</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return ReactDOM.createPortal(modalContent, modalRoot)
}

const modalStyle: React.CSSProperties = {
  display: 'block',
  position: 'fixed',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'rgba(0,0,0,0.4)',
  paddingTop: '60px',
}

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fefefe',
  margin: '5% auto',
  padding: '20px',
  border: '1px solid #888',
  borderRadius: '10px',
  width: '80%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}

const closeStyle: React.CSSProperties = {
  color: '#aaa',
  position: 'absolute',
  top: '0px',
  right: '10px',
  fontSize: '28px',
  fontWeight: 'bold',
  cursor: 'pointer',
}

const modalBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
}

const imageContainerStyle: React.CSSProperties = {
  flex: '1',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const detailsContainerStyle: React.CSSProperties = {
  flex: '2',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  overflowY: 'auto',
}

const tableContainerStyle: React.CSSProperties = {
  marginBottom: '20px',
}

const cardImageStyle: React.CSSProperties = {
  height: '100%',
  maxHeight: '100%',
  width: 'auto',
  objectFit: 'contain', // Ensure the image maintains its aspect ratio
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #ddd', // Set a border around the table
}

const tableHeaderStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
}

const tableCellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
}

const alternateCardsContainerStyle: React.CSSProperties = {
  marginTop: '30px',
}

const alternateCardsTitleStyle: React.CSSProperties = {
  fontSize: '1.5em',
  fontWeight: 'bold',
  marginBottom: '10px',
}

const alternateCardsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
}

const alternateCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
  width: 'calc(50% - 10px)', // Adjust width to fit two cards side by side with gap
}

const alternateVersionImageStyle: React.CSSProperties = {
  width: '100px',
  height: 'auto',
  marginRight: '10px',
}

const alternateCardDetailsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

export default CardModal
