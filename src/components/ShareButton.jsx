import React, { useState } from 'react'
import { FaShareAlt, FaCheck } from 'react-icons/fa'

const ShareButton = ({ itemType, itemId, itemTitle }) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/${itemType}/${itemId}`
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      const shareUrl = `${window.location.origin}/${itemType}/${itemId}`
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        alert('Could not copy link. Please copy manually: ' + shareUrl)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        copied 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      }`}
      style={{ minHeight: '32px' }}
      title={`Share ${itemTitle}`}
    >
      {copied ? (
        <>
          <FaCheck className="text-sm" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <FaShareAlt className="text-sm" />
          <span>Share</span>
        </>
      )}
    </button>
  )
}

export default ShareButton
