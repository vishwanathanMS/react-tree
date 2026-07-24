import { TreeView } from './treeview'

const initialData = [
  {
    id: 1,
    text: 'Documents',
    children: [
      { id: 2, text: 'Work', children: [{ id: 3, text: 'project.pdf' }] },
      { id: 4, text: 'Personal', children: [{ id: 5, text: 'vacation.png' }, { id: 6, text: 'budget.xlsx' }] }
    ]
  },
  {
    id: 7,
    text: 'Downloads',
    children: [
      { id: 8, text: 'chrome_installer.exe' },
      { id: 9, text: 'vscode_setup.exe' }
    ]
  }
];

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2>React TreeView Demo</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
        <TreeView
          dataSource={initialData}
          selectable
          multiple
          checkable
          draggable
          editable
          expandOnClick
          defaultExpanded={[1, 7]}
        />
      </div>
    </div>
  )
}

export default App
