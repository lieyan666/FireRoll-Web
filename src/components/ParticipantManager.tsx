import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Edit2, Trash2, Upload, Users, Download, Search } from 'lucide-react'
import { Participant } from '../types'

interface ParticipantManagerProps {
  participants: Participant[]
  onParticipantsChange: (participants: Participant[]) => void
  winners: Participant[]
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onParticipantsChange,
  winners,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newName, setNewName] = useState('')

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    if (newName.trim()) {
      const newParticipant: Participant = {
        id: Date.now(),
        name: newName.trim(),
      }
      onParticipantsChange([...participants, newParticipant])
      setNewName('')
    }
  }

  const handleBulkAdd = () => {
    const names = prompt('请输入参与者名单（每行一个名字）：')
    if (names) {
      const lines = names.split('\n').filter(line => line.trim())
      const newParticipants = lines.map((name, index) => ({
        id: Date.now() + index,
        name: name.trim(),
      }))
      onParticipantsChange([...participants, ...newParticipants])
    }
  }

  const handleEdit = (id: number) => {
    if (editingId === id && editingName.trim()) {
      const updated = participants.map(p =>
        p.id === id ? { ...p, name: editingName.trim() } : p
      )
      onParticipantsChange(updated)
      setEditingId(null)
      setEditingName('')
    } else {
      const participant = participants.find(p => p.id === id)
      if (participant) {
        setEditingId(id)
        setEditingName(participant.name)
      }
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此参与者吗？')) {
      onParticipantsChange(participants.filter(p => p.id !== id))
    }
  }

  const handleDeleteAll = () => {
    if (confirm('确定要清空所有参与者吗？')) {
      onParticipantsChange([])
    }
  }

  const exportParticipants = () => {
    const content = participants.map(p => p.name).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `participants_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const newParticipants = lines.map((name, index) => ({
        id: Date.now() + index,
        name: name.trim(),
      }))
      onParticipantsChange([...participants, ...newParticipants])
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="text-primary" />
        参与者管理
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索参与者..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={exportParticipants}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            title="导出名单"
          >
            <Download size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入姓名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-2"
          >
            <UserPlus size={18} />
            添加
          </button>
        </div>

        <div className="flex gap-2">
          <label className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer flex items-center justify-center gap-2">
            <Upload size={18} />
            从文件导入
            <input
              type="file"
              onChange={importFromFile}
              accept=".txt,.csv"
              className="hidden"
            />
          </label>
          <button
            onClick={handleBulkAdd}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            批量添加
          </button>
        </div>

        {participants.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                共 {participants.length} 人 / 已中奖 {winners.length} 人
              </span>
              <button
                onClick={handleDeleteAll}
                className="text-sm text-red-400 hover:text-red-300"
              >
                清空全部
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg p-3 space-y-1">
              <AnimatePresence>
                {filteredParticipants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      winners.some(w => w.id === participant.id)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {editingId === participant.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEdit(participant.id)}
                          className="flex-1 px-2 py-1 bg-gray-700 rounded text-white"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1">{participant.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(participant.id)}
                        className="p-1.5 rounded hover:bg-gray-600 transition-colors"
                      >
                        <Edit2 size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(participant.id)}
                        className="p-1.5 rounded hover:bg-gray-600 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ParticipantManager