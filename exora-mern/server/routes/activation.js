{
  "nodes": [
    {
      "parameters": {
        "method": "PUT",
        "url": "={{ 'https://n8n.exora.solutions/api/v1/workflows/' + $json.workflowId }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-N8N-API-KEY",
              "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGM3NzlmMi04M2VmLTRjNGMtYjIyZS1jZDcyNDUxNzQ5N2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4OTE1NDY4fQ.x-yTAMSzNhdPXXX_xnnZTLWY5VSUQ0oAeim1i0cT3RQ"
            },
            {
              "name": "Authorization",
              "value": "={{ 'Bearer ' + $node['Webhook Trigger1'].json['body']['accessToken'] }}"
            }
            ,
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ {\n  name: $json.updatedWorkflow.name,\n  nodes: $json.updatedWorkflow.nodes,\n  connections: $json.updatedWorkflow.connections,\n  settings: $json.updatedWorkflow.settings\n} }}",
        "options": {}
      },
      "id": "202a32bb-e0cf-47c1-ad68-87ebbf7317a8",
      "name": "PUT Updated Workflow1",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [
        368,
        0
      ]
    }
  ],
  "connections": {
    "PUT Updated Workflow1": {
      "main": [
        []
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "e8fa9ff92c09cfd3e57716a41d0676a5daea9c627115e9c484a21d01abdcf6a8"
  }
}