# ChatBot Component

A simple, clean chatbot interface for CloudCare that integrates with n8n webhook.

## Features

- ✅ Clean, modern UI with blue theme
- ✅ Real-time messaging
- ✅ Loading indicators
- ✅ Timestamp display
- ✅ Smooth animations
- ✅ Mobile responsive design
- ✅ Direct n8n webhook integration

## Configuration

The chatbot connects to your n8n webhook at:
```
http://localhost:5678/webhook/chatbot
```

## Usage

The chatbot automatically appears on all pages as a floating blue button in the bottom-right corner.

### User Interaction:
1. Click the blue chat button to open
2. Type your message in the input field
3. Press Enter or click Send button
4. View bot responses in real-time
5. Click X to close the chat window

## API Integration

The component sends POST requests to your n8n webhook with this format:

```json
{
  "query": "user message here",
  "timestamp": "2025-10-19T12:34:56.789Z"
}
```

The component can handle various response formats:
- `{ "output": "response text" }`
- `{ "response": "response text" }`
- `{ "text": "response text" }`
- `{ "message": "response text" }`
- Plain strings
- Any other JSON (will be stringified)

## Styling

The component uses inline styles for maximum compatibility and doesn't require any additional CSS setup. All colors, sizes, and animations are self-contained.

## Dependencies

- `lucide-react` - For icons (MessageCircle, X, Send)