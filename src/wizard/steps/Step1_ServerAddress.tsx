import { useState } from 'react'
import { Server, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useWizardStore } from '../../store/useWizardStore'
import { connect } from '../../lib/ioBroker/socket'
import { getSystemConfig } from '../../lib/ioBroker/iobroker-api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

type TestState = 'idle' | 'testing' | 'success' | 'error'

export default function Step1_ServerAddress() {
  const { serverUrl, setServerUrl, setStep } = useWizardStore()
  const [testState, setTestState] = useState<TestState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleTest = async () => {
    setTestState('testing')
    setErrorMsg('')
    try {
      await connect(serverUrl)
      await getSystemConfig()
      setTestState('success')
    } catch (e) {
      setTestState('error')
      setErrorMsg(e instanceof Error ? e.message : 'Verbindung fehlgeschlagen')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Server className="text-blue-400" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-white">ioBroker verbinden</h2>
          <p className="text-slate-400 text-sm">Gib die Adresse deines ioBroker Web-Adapters ein</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm text-slate-300">Server-Adresse</label>
        <div className="flex gap-2">
          <Input
            value={serverUrl}
            onChange={(e) => { setServerUrl(e.target.value); setTestState('idle') }}
            placeholder="http://192.168.1.100:8082"
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testState === 'testing' || !serverUrl}
          >
            {testState === 'testing' ? <Loader size={16} className="animate-spin" /> : 'Testen'}
          </Button>
        </div>

        {testState === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} />
            Verbindung erfolgreich!
          </div>
        )}
        {testState === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <XCircle size={16} />
            {errorMsg || 'Verbindung fehlgeschlagen. Überprüfe Adresse und Port.'}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Standard-Port des ioBroker Web-Adapters ist <span className="text-slate-300">8082</span>.
          Der Socket.IO-Adapter muss installiert sein.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={() => setStep(2)}
          disabled={testState !== 'success'}
        >
          Weiter →
        </Button>
      </div>
    </div>
  )
}
