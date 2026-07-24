import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useMemo, useRef } from 'react';
import { TreeView, TreeViewRef } from './TreeView';
import { TreeNode, CheckState } from './types/tree.types';
import {
  TreeviewItemContent,
  TreeItemToogle,
  TreeItemLoadingSpinner,
  TreeItemCkeck,
  TreeItemicon,
  TreeItemText,
} from './components/slots/TreeviewItemSlot';
import { DataManager, Query, JsonAdaptor } from '@syncfusion/react-data';



const meta: Meta<typeof TreeView> = {
  title: 'Components/TreeView',
  component: TreeView,
  argTypes: {
    selectable: { control: 'boolean', description: 'Enable node selection' },
    multiple: { control: 'boolean', description: 'Allow selecting multiple nodes' },
    checkable: { control: 'boolean', description: 'Show checkboxes for nodes' },
    editable: { control: 'boolean', description: 'Allow inline editing (double click)' },
    draggable: { control: 'boolean', description: 'Enable drag and drop reordering' },
    expandOnClick: { control: 'boolean', description: 'Expand/collapse node when clicking row' },
    virtual: { control: 'boolean', description: 'Enable virtual scrolling for large datasets' },
    itemHeight: { control: 'number', description: 'Row height in pixels for virtual scroll' },
    height: { control: 'number', description: 'Container height for virtualized view' },
  },
};

export default meta;
type Story = StoryObj<typeof TreeView>;

// --- Sample Datasets ---

const defaultData: TreeNode[] = [
  {
    id: 'src',
    text: 'src',
    children: [
      {
        id: 'components',
        text: 'components',
        children: [
          { id: 'Button.tsx', text: 'Button.tsx' },
          { id: 'Card.tsx', text: 'Card.tsx' },
          { id: 'Modal.tsx', text: 'Modal.tsx' },
        ],
      },
      {
        id: 'treeview',
        text: 'treeview',
        children: [
          { id: 'TreeView.tsx', text: 'TreeView.tsx' },
          { id: 'TreeView.stories.tsx', text: 'TreeView.stories.tsx' },
          { id: 'tree.types.ts', text: 'tree.types.ts' },
        ],
      },
      { id: 'App.tsx', text: 'App.tsx' },
      { id: 'main.tsx', text: 'main.tsx' },
      { id: 'index.css', text: 'index.css' },
    ],
  },
  {
    id: 'public',
    text: 'public',
    children: [
      { id: 'favicon.ico', text: 'favicon.ico' },
      { id: 'logo.svg', text: 'logo.svg' },
      { id: 'robots.txt', text: 'robots.txt' },
    ],
  },
  { id: 'package.json', text: 'package.json' },
  { id: 'tsconfig.json', text: 'tsconfig.json' },
  { id: 'README.md', text: 'README.md' },
];

// 1. Basic Default Story
export const Basic: Story = {
  args: {
    dataSource: defaultData,
    expandOnClick: true,
    defaultExpanded: ['src', 'components'],
  },
};

// 2. File Explorer Sample with Custom Node Rendering & Icons
export const FileExplorer = () => {
  const [treeData] = useState<TreeNode[]>([
    {
      id: 'project-root',
      text: 'react-treeview-project',
      data: { type: 'folder', size: '1.2 MB' },
      children: [
        {
          id: 'src-folder',
          text: 'src',
          data: { type: 'folder', size: '420 KB' },
          children: [
            { id: 'app-ts', text: 'App.tsx', data: { type: 'code', ext: 'tsx', size: '2.4 KB', tag: 'TSX' } },
            { id: 'index-css', text: 'styles.css', data: { type: 'style', ext: 'css', size: '1.1 KB', tag: 'CSS' } },
            { id: 'tree-comp', text: 'TreeView.tsx', data: { type: 'code', ext: 'tsx', size: '7.8 KB', tag: 'TSX' } },
            { id: 'tree-test', text: 'TreeView.test.tsx', data: { type: 'code', ext: 'test', size: '4.5 KB', tag: 'TEST' } },
          ],
        },
        {
          id: 'assets-folder',
          text: 'assets',
          data: { type: 'folder', size: '750 KB' },
          children: [
            { id: 'banner-img', text: 'hero-banner.png', data: { type: 'image', ext: 'png', size: '540 KB', tag: 'PNG' } },
            { id: 'icon-svg', text: 'logo-mark.svg', data: { type: 'image', ext: 'svg', size: '12 KB', tag: 'SVG' } },
          ],
        },
        { id: 'pkg-json', text: 'package.json', data: { type: 'json', ext: 'json', size: '1.2 KB', tag: 'JSON' } },
        { id: 'readme-md', text: 'README.md', data: { type: 'doc', ext: 'md', size: '3.5 KB', tag: 'DOC' } },
      ],
    },
  ]);

  const treeRef = useRef<TreeViewRef>(null);

  const getFileIcon = (node: TreeNode) => {
    const meta = node.data as { type?: string; ext?: string } | undefined;
    const isFolder = !!node.children?.length || meta?.type === 'folder';

    if (isFolder) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#EAB308" style={{ marginRight: 6, flexShrink: 0 }}>
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      );
    }

    switch (meta?.type) {
      case 'code':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
          </svg>
        );
      case 'image':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#EC4899" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        );
      case 'json':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 5v2h2V8H7zm8 0v2h2V8h-2zm-4 4v2h2v-2h-2z" />
          </svg>
        );
      case 'style':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#06B6D4" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l2.69-2.69C9.93 19.63 10.93 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9CA3AF" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        );
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#1E293B', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#38BDF8">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
          </svg>
          EXPLORER
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => treeRef.current?.expandAll()}
            style={{ background: '#334155', color: '#CBD5E1', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}
          >
            Expand All
          </button>
          <button
            onClick={() => treeRef.current?.collapseAll()}
            style={{ background: '#334155', color: '#CBD5E1', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}
          >
            Collapse All
          </button>
        </div>
      </div>

      <TreeView
        ref={treeRef}
        dataSource={treeData}
        expandOnClick
        selectable
        editable
        draggable
        defaultExpanded={['project-root', 'src-folder']}
        renderNode={(node) => {
          const meta = node.data as { tag?: string; size?: string } | undefined;
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: 13, padding: '2px 0' }}>
              {getFileIcon(node)}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F1F5F9' }}>
                {node.text}
              </span>
              {meta?.tag && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: '#334155', color: '#94A3B8', marginLeft: 8 }}>
                  {meta.tag}
                </span>
              )}
              {meta?.size && (
                <span style={{ fontSize: 11, color: '#64748B', marginLeft: 8, fontVariantNumeric: 'tabular-nums' }}>
                  {meta.size}
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

// 3. Checkable Tree with Cascade Selection & Dynamic Summary
export const CheckableAndSelection = () => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [checkedMap, setCheckedMap] = useState<Map<string | number, CheckState>>(new Map());

  const checkedCount = useMemo(() => {
    let count = 0;
    checkedMap.forEach((state) => {
      if (state === 'checked') count++;
    });
    return count;
  }, [checkedMap]);

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 16, width: 360, background: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#0F172A' }}>Permissions & Access Control</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: 12, color: '#64748B' }}>
          Checkboxes feature tri-state / cascade selection for parent and child nodes.
        </p>
        <TreeView
          dataSource={[
            {
              id: 'admin',
              text: 'Administrator Privileges',
              children: [
                {
                  id: 'user-mgmt',
                  text: 'User Management',
                  children: [
                    { id: 'user-create', text: 'Create Users' },
                    { id: 'user-edit', text: 'Edit Users' },
                    { id: 'user-delete', text: 'Delete Users' },
                  ],
                },
                {
                  id: 'role-mgmt',
                  text: 'Role Management',
                  children: [
                    { id: 'role-view', text: 'View Roles' },
                    { id: 'role-assign', text: 'Assign Roles' },
                  ],
                },
              ],
            },
            {
              id: 'content',
              text: 'Content Management',
              children: [
                { id: 'post-create', text: 'Publish Posts' },
                { id: 'post-moderate', text: 'Moderate Comments' },
                { id: 'media-upload', text: 'Upload Media' },
              ],
            },
            {
              id: 'settings',
              text: 'System Settings',
              children: [
                { id: 'billing-view', text: 'View Billing' },
                { id: 'api-keys', text: 'Manage API Keys' },
              ],
            },
          ]}
          checkable
          selectable
          multiple
          expandOnClick
          defaultExpanded={['admin', 'user-mgmt', 'content']}
          onNodeSelect={(node) => {
            setSelectedIds((prev) =>
              prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id]
            );
          }}
          onNodeCheck={(_node, map) => {
            setCheckedMap(new Map(map));
          }}
        />
      </div>

      <div style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 16, minWidth: 260, flex: 1, background: '#F8FAFC' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#1E293B' }}>Live Selection Summary</h4>
        <div style={{ marginBottom: 16, background: '#EFF6FF', padding: 12, borderRadius: 6, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>Checked Nodes ({checkedCount}):</div>
          <div style={{ fontSize: 12, color: '#1E40AF', marginTop: 4, wordBreak: 'break-all' }}>
            {Array.from(checkedMap.entries())
              .filter(([, state]) => state === 'checked')
              .map(([id]) => id)
              .join(', ') || 'None'}
          </div>
        </div>

        <div style={{ background: '#F0FDF4', padding: 12, borderRadius: 6, border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>Selected Nodes ({selectedIds.length}):</div>
          <div style={{ fontSize: 12, color: '#166534', marginTop: 4, wordBreak: 'break-all' }}>
            {selectedIds.join(', ') || 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Interactive Drag & Drop Reordering
export const DragAndDropReorder = () => {
  const [data] = useState<TreeNode[]>([
    {
      id: 'todo',
      text: '📋 To Do',
      children: [
        { id: 'task-1', text: 'Design new TreeView components' },
        { id: 'task-2', text: 'Add Storybook sample documentation' },
        { id: 'task-3', text: 'Optimize virtual scrolling performance' },
      ],
    },
    {
      id: 'in-progress',
      text: '🚀 In Progress',
      children: [
        { id: 'task-4', text: 'Write comprehensive vitest unit tests' },
        { id: 'task-5', text: 'Refactor Material 3 design tokens' },
      ],
    },
    {
      id: 'done',
      text: '✅ Completed',
      children: [
        { id: 'task-6', text: 'Setup Vite + React 19 project' },
      ],
    },
  ]);

  const [lastDropEvent, setLastDropEvent] = useState<string>('Drag items between categories or reorder them!');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Drag & Drop Task Organizer</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Drag any task node to move it before, inside, or after another node.
      </p>

      <div style={{ padding: 8, background: '#FEF3C7', borderRadius: 6, fontSize: 12, color: '#92400E', marginBottom: 12, border: '1px solid #FDE68A' }}>
        <strong>Status:</strong> {lastDropEvent}
      </div>

      <TreeView
        dataSource={data}
        draggable
        expandOnClick
        defaultExpanded={['todo', 'in-progress', 'done']}
        onNodeDrop={(source, target, position) => {
          setLastDropEvent(`Moved "${source.text}" ${position} "${target.text}"`);
        }}
      />
    </div>
  );
};

// 5. Inline Editing / Renaming
export const InlineEditing = () => {
  const [data] = useState<TreeNode[]>([
    {
      id: 'folder-1',
      text: 'Double click any item to edit',
      children: [
        { id: 'item-1', text: 'Click me twice to rename' },
        { id: 'item-2', text: 'Press Enter to save' },
        { id: 'item-3', text: 'Press Escape to cancel' },
      ],
    },
  ]);

  const [lastEdited, setLastEdited] = useState<string>('No edits yet');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 420, border: '1px solid #CBD5E1', borderRadius: 10, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Inline Renaming</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Double-click any label to activate inline edit input.
      </p>

      <div style={{ fontSize: 12, padding: '6px 10px', background: '#F1F5F9', borderRadius: 6, marginBottom: 12, color: '#334155' }}>
        <strong>Last Edit:</strong> {lastEdited}
      </div>

      <TreeView
        dataSource={data}
        editable
        expandOnClick
        defaultExpanded={['folder-1']}
        onNodeEdit={(node, value) => {
          setLastEdited(`Node [${node.id}] changed from "${node.text}" to "${value}"`);
        }}
      />
    </div>
  );
};

// 6. Lazy Loading (Async Children Fetching)
export const LazyLoadingAsync = () => {
  const initialAsyncData: TreeNode[] = [
    { id: 'db-users', text: '🗄️ database_users_table', hasChildren: true },
    { id: 'db-orders', text: '🗄️ database_orders_table', hasChildren: true },
    { id: 'db-logs', text: '🗄️ database_system_logs', hasChildren: true },
  ];

  const handleLoadChildren = (node: TreeNode): Promise<TreeNode[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: `${node.id}-col1`, text: `🔑 id (PRIMARY KEY, BIGINT)` },
          { id: `${node.id}-col2`, text: `📝 name (VARCHAR 255)` },
          { id: `${node.id}-col3`, text: `📅 created_at (TIMESTAMP)` },
          { id: `${node.id}-sub`, text: `📁 indexes & constraints`, hasChildren: true },
        ]);
      }, 1200);
    });
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 420, border: '1px solid #CBD5E1', borderRadius: 10, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Lazy Loading Database Schema</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Children are loaded on-demand via async API requests when a parent node is expanded.
      </p>

      <TreeView dataSource={initialAsyncData} loadChildren={handleLoadChildren} expandOnClick />
    </div>
  );
};

// 7. Custom Field Mapping Sample
export const FieldMappingSample = () => {
  // Custom API response model with non-standard key names
  const customDataApi = [
    {
      key: 'cat-1',
      title: 'Electronics',
      subCategories: [
        { key: 'prod-1', title: 'Smartphones & Mobile Devices' },
        { key: 'prod-2', title: 'Laptops & Workstations' },
      ],
    },
    {
      key: 'cat-2',
      title: 'Home Appliances',
      subCategories: [
        { key: 'prod-3', title: 'Air Purifiers' },
        { key: 'prod-4', title: 'Smart Refrigerators' },
      ],
    },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 420, border: '1px solid #CBD5E1', borderRadius: 10, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Custom Data Field Mapping</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Map custom object properties (<code>key</code> &rarr; <code>id</code>, <code>title</code> &rarr; <code>text</code>, <code>subCategories</code> &rarr; <code>children</code>).
      </p>

      <TreeView
        dataSource={customDataApi}
        fieldMapping={{
          id: 'key',
          text: 'title',
          children: 'subCategories',
        }}
        expandOnClick
        defaultExpanded={['cat-1', 'cat-2']}
      />
    </div>
  );
};

// 8. Programmatic API Control (Imperative Ref Methods)
export const ImperativeRefMethods = () => {
  const treeRef = useRef<TreeViewRef>(null);
  const [selectedNodeText, setSelectedNodeText] = useState<string>('None');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 450, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Programmatic Tree Controls</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Control tree state using imperative ref methods (<code>expandAll</code>, <code>collapseAll</code>, <code>select</code>, <code>check</code>).
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => treeRef.current?.expandAll()}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
        >
          Expand All
        </button>
        <button
          onClick={() => treeRef.current?.collapseAll()}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
        >
          Collapse All
        </button>
        <button
          onClick={() => treeRef.current?.select('node-2')}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #3B82F6', background: '#EFF6FF', color: '#1D4ED8', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
        >
          Select Node 2
        </button>
        <button
          onClick={() => treeRef.current?.check('node-3')}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #10B981', background: '#ECFDF5', color: '#047857', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
        >
          Check Node 3
        </button>
        <button
          onClick={() => {
            const node = treeRef.current?.getNode('node-1');
            setSelectedNodeText(node ? node.text || 'Found' : 'Not Found');
          }}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #8B5CF6', background: '#F5F3FF', color: '#6D28D9', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
        >
          Get Node 1
        </button>
      </div>

      <div style={{ fontSize: 12, padding: 8, background: '#F1F5F9', borderRadius: 6, marginBottom: 12 }}>
        <strong>Retrieved Node Text:</strong> {selectedNodeText}
      </div>

      <TreeView
        ref={treeRef}
        dataSource={[
          {
            id: 'node-1',
            text: 'Node 1 (Parent)',
            children: [
              { id: 'node-2', text: 'Node 2 (Child)' },
              { id: 'node-3', text: 'Node 3 (Child)' },
            ],
          },
          {
            id: 'node-4',
            text: 'Node 4 (Parent)',
            children: [
              { id: 'node-5', text: 'Node 5 (Child)' },
            ],
          },
        ]}
        selectable
        checkable
        expandOnClick
      />
    </div>
  );
};

// 9. Custom Sorting (Folders First, Then Alphabetical)
export const CustomSorting = () => {
  const scrambledData: TreeNode[] = [
    { id: 'file-z', text: 'zebra.png' },
    { id: 'folder-b', text: 'Backend', children: [{ id: 'b1', text: 'server.ts' }] },
    { id: 'file-a', text: 'apple.config.js' },
    { id: 'folder-a', text: 'Assets', children: [{ id: 'a1', text: 'logo.svg' }] },
    { id: 'file-m', text: 'main.tsx' },
  ];

  // Custom sort function: Folders first, then alphabetical
  const sortFoldersFirst = (a: TreeNode, b: TreeNode) => {
    const aIsFolder = !!a.children?.length;
    const bIsFolder = !!b.children?.length;

    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;

    return (a.text || '').localeCompare(b.text || '');
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 420, border: '1px solid #CBD5E1', borderRadius: 10, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Sorted Tree (Folders First & Alphabetical)</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Uses <code>sortOrder</code> prop function to ensure folders appear before standalone files.
      </p>

      <TreeView dataSource={scrambledData} sortOrder={sortFoldersFirst} expandOnClick defaultExpanded={['folder-a', 'folder-b']} />
    </div>
  );
};

// 10. Organization Chart Sample with Avatars & Badges
export const OrganizationChart = () => {
  const orgData: TreeNode[] = [
    {
      id: 'exec',
      text: 'Executive Leadership',
      data: { role: 'VP & Executive Office', count: 12 },
      children: [
        {
          id: 'ceo',
          text: 'Sarah Jenkins',
          data: { role: 'Chief Executive Officer', status: 'Online', avatar: '👩‍💼', badge: 'CEO' },
          children: [
            {
              id: 'cto',
              text: 'Alex Rivera',
              data: { role: 'Chief Technology Officer', status: 'In a meeting', avatar: '👨‍💻', badge: 'CTO' },
              children: [
                {
                  id: 'eng-lead',
                  text: 'David Chen',
                  data: { role: 'Lead Frontend Architect', status: 'Online', avatar: '👨‍🔧', badge: 'ENG' },
                  children: [
                    { id: 'dev-1', text: 'Emma Watson', data: { role: 'Senior React Engineer', status: 'Online', avatar: '👩‍💻' } },
                    { id: 'dev-2', text: 'Liam O\'Connor', data: { role: 'UI/UX Engineer', status: 'Offline', avatar: '👨‍🎨' } },
                  ],
                },
                {
                  id: 'devops-lead',
                  text: 'Sophia Martinez',
                  data: { role: 'DevOps & Infrastructure Lead', status: 'Online', avatar: '👩‍🔬', badge: 'OPS' },
                },
              ],
            },
            {
              id: 'cpo',
              text: 'Michael Scott',
              data: { role: 'Chief Product Officer', status: 'Away', avatar: '👨‍💼', badge: 'PRODUCT' },
            },
          ],
        },
      ],
    },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FAF5FF' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#581C87' }}>🏢 Company Organization Hierarchy</h3>

      <TreeView
        dataSource={orgData}
        expandOnClick
        defaultExpanded={['exec', 'ceo', 'cto', 'eng-lead']}
        renderNode={(node) => {
          const info = node.data as { role?: string; status?: string; avatar?: string; badge?: string } | undefined;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', width: '100%' }}>
              <span style={{ fontSize: 16 }}>{info?.avatar || '📁'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#3B0764' }}>{node.text}</span>
                  {info?.badge && (
                    <span style={{ fontSize: 9, fontWeight: 700, background: '#7E22CE', color: '#FFFFFF', padding: '1px 5px', borderRadius: 4 }}>
                      {info.badge}
                    </span>
                  )}
                </div>
                {info?.role && <div style={{ fontSize: 11, color: '#6B21A8' }}>{info.role}</div>}
              </div>
              {info?.status && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: info.status === 'Online' ? '#DCFCE7' : info.status === 'Away' ? '#FEF9C3' : '#F3F4F6',
                    color: info.status === 'Online' ? '#15803D' : info.status === 'Away' ? '#A16207' : '#4B5563',
                    fontWeight: 500,
                  }}
                >
                  {info.status}
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

// 11. High-Performance Virtualization (100,000+ Nodes)
export const Virtualized100kNodes = () => {
  const virtualData = useMemo(() => {
    const data: TreeNode[] = [];
    for (let i = 1; i <= 1000; i++) {
      const children: TreeNode[] = [];
      for (let j = 1; j <= 100; j++) {
        children.push({
          id: `child-${i}-${j}`,
          text: `📄 Record Item #${i}-${j}`,
        });
      }
      data.push({
        id: `root-${i}`,
        text: `📁 Root Category #${i} (100 items)`,
        children,
      });
    }
    return data; // 1,000 roots x 100 children = 100,000 total nodes!
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 450, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>⚡ 100,000 Nodes Virtualized</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Renders only visible DOM rows using virtual windowing. 60 FPS scrolling experience!
      </p>

      <TreeView
        dataSource={virtualData}
        virtual
        height={360}
        itemHeight={30}
        expandOnClick
        selectable
        checkable
        defaultExpanded={['root-1', 'root-2']}
      />
    </div>
  );
};

// 12. Custom Theming (Dark Mode & Brand Colors)
export const CustomTheming = () => {
  const [theme, setTheme] = useState<'dark' | 'cyberpunk' | 'emerald'>('dark');

  const getThemeStyles = (): React.CSSProperties => {
    switch (theme) {
      case 'cyberpunk':
        return {
          ['--tree-bg' as string]: '#0F172A',
          ['--tree-text' as string]: '#38BDF8',
          ['--tree-hover' as string]: 'rgba(56, 189, 248, 0.15)',
          ['--tree-selected' as string]: '#0284C7',
          ['--tree-selected-text' as string]: '#FFFFFF',
          ['--tree-focus-ring' as string]: '#F43F5E',
          background: '#090D16',
          color: '#38BDF8',
          border: '1px solid #1E293B',
        };
      case 'emerald':
        return {
          ['--tree-bg' as string]: '#ECFDF5',
          ['--tree-text' as string]: '#065F46',
          ['--tree-hover' as string]: '#D1FAE5',
          ['--tree-selected' as string]: '#059669',
          ['--tree-selected-text' as string]: '#FFFFFF',
          ['--tree-focus-ring' as string]: '#10B981',
          background: '#F0FDF4',
          color: '#065F46',
          border: '1px solid #A7F3D0',
        };
      case 'dark':
      default:
        return {
          ['--tree-bg' as string]: '#18181B',
          ['--tree-text' as string]: '#E4E4E7',
          ['--tree-hover' as string]: '#27272A',
          ['--tree-selected' as string]: '#3F3F46',
          ['--tree-selected-text' as string]: '#FAFAFA',
          ['--tree-focus-ring' as string]: '#A1A1AA',
          background: '#18181B',
          color: '#E4E4E7',
          border: '1px solid #27272A',
        };
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 420 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setTheme('dark')}
          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#27272A', color: '#FFF', cursor: 'pointer', fontSize: 12 }}
        >
          Dark Theme
        </button>
        <button
          onClick={() => setTheme('cyberpunk')}
          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#0284C7', color: '#FFF', cursor: 'pointer', fontSize: 12 }}
        >
          Cyberpunk Neon
        </button>
        <button
          onClick={() => setTheme('emerald')}
          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#059669', color: '#FFF', cursor: 'pointer', fontSize: 12 }}
        >
          Emerald Theme
        </button>
      </div>

      <div style={{ borderRadius: 10, padding: 16, ...getThemeStyles() }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Themed TreeView</h4>
        <TreeView
          dataSource={defaultData}
          selectable
          checkable
          expandOnClick
          defaultExpanded={['src', 'components']}
        />
      </div>
    </div>
  );
};

// 13. Virtualized 5-Level Deep Nesting (500,000+ Nodes)
export const Virtualized500kDeepNesting = () => {
  const { data500k, expandedKeys } = useMemo(() => {
    const data: TreeNode[] = [];
    const expanded: string[] = [];

    // Level 1: 50 Divisions
    for (let i = 1; i <= 50; i++) {
      const l1Id = `L1-${i}`;
      if (i === 1) expanded.push(l1Id);

      const l2Children: TreeNode[] = [];
      // Level 2: 10 Departments per division (500 total)
      for (let j = 1; j <= 10; j++) {
        const l2Id = `${l1Id}-L2-${j}`;
        if (i === 1 && j === 1) expanded.push(l2Id);

        const l3Children: TreeNode[] = [];
        // Level 3: 10 Projects per department (5,000 total)
        for (let k = 1; k <= 10; k++) {
          const l3Id = `${l2Id}-L3-${k}`;
          if (i === 1 && j === 1 && k === 1) expanded.push(l3Id);

          const l4Children: TreeNode[] = [];
          // Level 4: 10 Modules per project (50,000 total)
          for (let m = 1; m <= 10; m++) {
            const l4Id = `${l3Id}-L4-${m}`;
            if (i === 1 && j === 1 && k === 1 && m === 1) expanded.push(l4Id);

            const l5Children: TreeNode[] = [];
            // Level 5: 10 Data Records per module (500,000 total leaf nodes!)
            for (let n = 1; n <= 10; n++) {
              l5Children.push({
                id: `${l4Id}-L5-${n}`,
                text: `📄 Record_L5_${i}_${j}_${k}_${m}_${n}.json`,
              });
            }

            l4Children.push({
              id: l4Id,
              text: `⚙️ Module_L4_${m} (10 items)`,
              children: l5Children,
            });
          }

          l3Children.push({
            id: l3Id,
            text: `📦 Project_L3_${k} (10 modules)`,
            children: l4Children,
          });
        }

        l2Children.push({
          id: l2Id,
          text: `📂 Department_L2_${j} (10 projects)`,
          children: l3Children,
        });
      }

      data.push({
        id: l1Id,
        text: `🏢 Enterprise Division_L1_${i} (10 depts)`,
        children: l2Children,
      });
    }

    return { data500k: data, expandedKeys: expanded };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 500, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>🚀 500,000+ Nodes (5-Level Deep Nesting)</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Virtual windowing combined with 5-level nested DOM rendering. Smooth 60 FPS scrolling over 500,000+ items!
      </p>

      <TreeView
        dataSource={data500k}
        virtual
        height={400}
        itemHeight={30}
        expandOnClick
        selectable
        checkable
        defaultExpanded={expandedKeys}
      />
    </div>
  );
};

// 14. Standard 5-Level Deep Nesting (Non-Virtualized Recursive Nested DOM)
export const Standard5LevelDeepNesting = () => {
  const nestedData: TreeNode[] = [
    {
      id: 'sys-cloud',
      text: '🌐 Cloud Architecture (Level 1)',
      children: [
        {
          id: 'sub-auth',
          text: '🔐 Authentication Subsystem (Level 2)',
          children: [
            {
              id: 'ms-oauth',
              text: '🛡️ OAuth2 Microservice (Level 3)',
              children: [
                {
                  id: 'ctrl-token',
                  text: '⚙️ TokenController (Level 4)',
                  children: [
                    { id: 'ep-issue', text: '🔑 POST /api/v1/auth/token (Level 5)' },
                    { id: 'ep-refresh', text: '🔄 POST /api/v1/auth/refresh (Level 5)' },
                    { id: 'ep-revoke', text: '🚫 POST /api/v1/auth/revoke (Level 5)' },
                  ],
                },
                {
                  id: 'ctrl-user',
                  text: '⚙️ UserController (Level 4)',
                  children: [
                    { id: 'ep-profile', text: '👤 GET /api/v1/users/me (Level 5)' },
                    { id: 'ep-update', text: '✏️ PUT /api/v1/users/me (Level 5)' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'sub-billing',
          text: '💳 Payment & Billing Subsystem (Level 2)',
          children: [
            {
              id: 'ms-stripe',
              text: '💰 Stripe Service (Level 3)',
              children: [
                {
                  id: 'ctrl-sub',
                  text: '⚙️ SubscriptionHandler (Level 4)',
                  children: [
                    { id: 'ep-checkout', text: '🛒 POST /api/v1/checkout/session (Level 5)' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>🌳 Standard 5-Level Deep Nesting (Non-Virtualized)</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Pure recursive nested DOM rendering (<code>virtual=false</code>). Indentation is applied via nested CSS padding on <code>.tree-node-children</code>.
      </p>

      <TreeView
        dataSource={nestedData}
        virtual={false}
        expandOnClick
        selectable
        checkable
        editable
        draggable
        defaultExpanded={['sys-cloud', 'sub-auth', 'ms-oauth', 'ctrl-token']}
      />
    </div>
  );
};

// 15. Standard 500,000+ Nodes Non-Virtualized Benchmark
export const Standard500kNonVirtualized = () => {
  const { data500k, expandedKeys } = useMemo(() => {
    const data: TreeNode[] = [];
    const expanded: string[] = [];

    // Level 1: 50 Divisions
    for (let i = 1; i <= 50; i++) {
      const l1Id = `NV-L1-${i}`;
      if (i === 1) expanded.push(l1Id);

      const l2Children: TreeNode[] = [];
      // Level 2: 10 Departments per division
      for (let j = 1; j <= 10; j++) {
        const l2Id = `${l1Id}-L2-${j}`;
        if (i === 1 && j === 1) expanded.push(l2Id);

        const l3Children: TreeNode[] = [];
        // Level 3: 10 Projects per department
        for (let k = 1; k <= 10; k++) {
          const l3Id = `${l2Id}-L3-${k}`;
          if (i === 1 && j === 1 && k === 1) expanded.push(l3Id);

          const l4Children: TreeNode[] = [];
          // Level 4: 10 Modules per project
          for (let m = 1; m <= 10; m++) {
            const l4Id = `${l3Id}-L4-${m}`;
            if (i === 1 && j === 1 && k === 1 && m === 1) expanded.push(l4Id);

            const l5Children: TreeNode[] = [];
            // Level 5: 10 Data Records per module (500,000 leaf nodes total!)
            for (let n = 1; n <= 10; n++) {
              l5Children.push({
                id: `${l4Id}-L5-${n}`,
                text: `📄 NonVert_Leaf_${i}_${j}_${k}_${m}_${n}.json`,
              });
            }

            l4Children.push({
              id: l4Id,
              text: `⚙️ NonVert_Module_L4_${m} (10 items)`,
              children: l5Children,
            });
          }

          l3Children.push({
            id: l3Id,
            text: `📦 NonVert_Project_L3_${k} (10 modules)`,
            children: l4Children,
          });
        }

        l2Children.push({
          id: l2Id,
          text: `📂 NonVert_Dept_L2_${j} (10 projects)`,
          children: l3Children,
        });
      }

      data.push({
        id: l1Id,
        text: `🏢 NonVert_Division_L1_${i} (10 depts)`,
        children: l2Children,
      });
    }

    return { data500k: data, expandedKeys: expanded };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 500, border: '1px solid #F87171', borderRadius: 12, padding: 16, background: '#FEF2F2' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#991B1B' }}>⚠️ 500,000+ Nodes Non-Virtualized Benchmark</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#7F1D1D' }}>
        Renders nodes without virtual windowing (<code>virtual=false</code>). Tests browser DOM node performance over 500k nested items!
      </p>

      <TreeView
        dataSource={data500k}
        virtual={false}
        expandOnClick
        selectable
        checkable
        defaultExpanded={expandedKeys}
      />
    </div>
  );
};

// 16. Virtualized 100,000+ Nodes (All Parents Expanded)
export const Virtualized100kAllExpanded = () => {
  const { data100k, allParentIds } = useMemo(() => {
    const data: TreeNode[] = [];
    const parentIds: (string | number)[] = [];

    // Level 1: 10 Divisions
    for (let i = 1; i <= 10; i++) {
      const l1Id = `AE-L1-${i}`;
      parentIds.push(l1Id);

      const l2Children: TreeNode[] = [];
      // Level 2: 10 Departments per division
      for (let j = 1; j <= 10; j++) {
        const l2Id = `${l1Id}-L2-${j}`;
        parentIds.push(l2Id);

        const l3Children: TreeNode[] = [];
        // Level 3: 10 Projects per department
        for (let k = 1; k <= 10; k++) {
          const l3Id = `${l2Id}-L3-${k}`;
          parentIds.push(l3Id);

          const l4Children: TreeNode[] = [];
          // Level 4: 10 Modules per project
          for (let m = 1; m <= 10; m++) {
            const l4Id = `${l3Id}-L4-${m}`;
            parentIds.push(l4Id);

            const l5Children: TreeNode[] = [];
            // Level 5: 10 Data Records per module (100,000 leaf nodes total)
            for (let n = 1; n <= 10; n++) {
              l5Children.push({
                id: `${l4Id}-L5-${n}`,
                text: `📄 Record_L5_${i}_${j}_${k}_${m}_${n}.json`,
              });
            }

            l4Children.push({
              id: l4Id,
              text: `⚙️ Module_L4_${m} (10 items)`,
              children: l5Children,
            });
          }

          l3Children.push({
            id: l3Id,
            text: `📦 Project_L3_${k} (10 modules)`,
            children: l4Children,
          });
        }

        l2Children.push({
          id: l2Id,
          text: `📂 Department_L2_${j} (10 projects)`,
          children: l3Children,
        });
      }

      data.push({
        id: l1Id,
        text: `🏢 Enterprise Division_L1_${i} (10 depts)`,
        children: l2Children,
      });
    }

    return { data100k: data, allParentIds: parentIds };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 500, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>👐 100,000+ Nodes (All 11,110 Parents Expanded)</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Virtual windowing with all 11,110 parent nodes expanded simultaneously. Renders 111,110 total active visible rows at 60 FPS!
      </p>

      <TreeView
        dataSource={data100k}
        virtual
        height={420}
        itemHeight={30}
        expandOnClick
        selectable
        checkable
        defaultExpanded={allParentIds}
      />
    </div>
  );
};

// 17. Virtualized 100,000+ Nodes (All Parents Expanded & All Nodes Checked)
export const Virtualized100kAllChecked = () => {
  const { data100k, allNodeIds, allParentIds } = useMemo(() => {
    const data: TreeNode[] = [];
    const nodeIds: (string | number)[] = [];
    const parentIds: (string | number)[] = [];

    // Level 1: 10 Divisions
    for (let i = 1; i <= 10; i++) {
      const l1Id = `AC-L1-${i}`;
      nodeIds.push(l1Id);
      parentIds.push(l1Id);

      const l2Children: TreeNode[] = [];
      // Level 2: 10 Departments per division
      for (let j = 1; j <= 10; j++) {
        const l2Id = `${l1Id}-L2-${j}`;
        nodeIds.push(l2Id);
        parentIds.push(l2Id);

        const l3Children: TreeNode[] = [];
        // Level 3: 10 Projects per department
        for (let k = 1; k <= 10; k++) {
          const l3Id = `${l2Id}-L3-${k}`;
          nodeIds.push(l3Id);
          parentIds.push(l3Id);

          const l4Children: TreeNode[] = [];
          // Level 4: 10 Modules per project
          for (let m = 1; m <= 10; m++) {
            const l4Id = `${l3Id}-L4-${m}`;
            nodeIds.push(l4Id);
            parentIds.push(l4Id);

            const l5Children: TreeNode[] = [];
            // Level 5: 10 Data Records per module (100,000 leaf nodes total)
            for (let n = 1; n <= 10; n++) {
              const l5Id = `${l4Id}-L5-${n}`;
              nodeIds.push(l5Id);
              l5Children.push({
                id: l5Id,
                text: `📄 Record_L5_${i}_${j}_${k}_${m}_${n}.json`,
              });
            }

            l4Children.push({
              id: l4Id,
              text: `⚙️ Module_L4_${m} (10 items)`,
              children: l5Children,
            });
          }

          l3Children.push({
            id: l3Id,
            text: `📦 Project_L3_${k} (10 modules)`,
            children: l4Children,
          });
        }

        l2Children.push({
          id: l2Id,
          text: `📂 Department_L2_${j} (10 projects)`,
          children: l3Children,
        });
      }

      data.push({
        id: l1Id,
        text: `🏢 Enterprise Division_L1_${i} (10 depts)`,
        children: l2Children,
      });
    }

    return { data100k: data, allNodeIds: nodeIds, allParentIds: parentIds };
  }, []);

  const [checked, setChecked] = useState<(string | number)[]>(allNodeIds);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 500, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>☑️ 100,000+ Nodes (All Parents Expanded & All Nodes Checked)</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Virtual windowing with all 11,110 parent nodes expanded and all 111,110 total nodes checked in state simultaneously. Renders 111,110 active visible rows at 60 FPS!
      </p>

      <TreeView
        dataSource={data100k}
        virtual
        height={420}
        itemHeight={30}
        expandOnClick
        selectable
        checkable
        checked={checked}
        defaultExpanded={allParentIds}
        onNodeCheck={(_node, map) => {
          const nextChecked: (string | number)[] = [];
          map.forEach((state, id) => {
            if (state === 'checked') nextChecked.push(id);
          });
          setChecked(nextChecked);
        }}
      />
    </div>
  );
};

// 18. Self-Referential Data with Virtualization (100,000+ Flat Array Nodes)
export const SelfReferentialVirtualized = () => {
  const { flatData, defaultExpandedKeys } = useMemo(() => {
    const flat: TreeNode[] = [];
    const expanded: (string | number)[] = [];

    // Level 1: 50 Root Divisions (parentId: null)
    for (let i = 1; i <= 50; i++) {
      const rootId = `flat-root-${i}`;
      flat.push({
        id: rootId,
        parentId: null,
        text: `🏢 Enterprise Division #${i} (Self-Referential Flat Node)`,
      });

      if (i <= 3) expanded.push(rootId);

      // Level 2: 20 Departments per division (1,000 total)
      for (let j = 1; j <= 20; j++) {
        const deptId = `${rootId}-dept-${j}`;
        flat.push({
          id: deptId,
          parentId: rootId,
          text: `📂 Dept ${i}.${j} (Parent ID: ${rootId})`,
        });

        if (i === 1 && j <= 3) expanded.push(deptId);

        // Level 3: 5 Teams per department (5,000 total)
        for (let k = 1; k <= 5; k++) {
          const teamId = `${deptId}-team-${k}`;
          flat.push({
            id: teamId,
            parentId: deptId,
            text: `📦 Team ${i}.${j}.${k} (Parent ID: ${deptId})`,
          });

          if (i === 1 && j === 1 && k <= 2) expanded.push(teamId);

          // Level 4: 20 Records per team (100,000 leaf nodes!)
          for (let m = 1; m <= 20; m++) {
            const recordId = `${teamId}-rec-${m}`;
            flat.push({
              id: recordId,
              parentId: teamId,
              text: `📄 Flat Record #${i}.${j}.${k}.${m} (Ref -> ${teamId})`,
            });
          }
        }
      }
    }

    return { flatData: flat, defaultExpandedKeys: expanded };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 540, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#0F172A' }}>🔗 100,000+ Self-Referential Nodes Virtualized</h3>
        <span style={{ fontSize: 11, fontWeight: 700, background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: 12 }}>
          1D Flat Array
        </span>
      </div>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Data is provided as a single 106,050-item flat array with <code>parentId</code> references (no nested <code>children</code> arrays). The component automatically constructs the tree hierarchy and virtualizes row rendering at 60 FPS.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, color: '#475569' }}>
        <div><strong>Total Flat Array Items:</strong> {flatData.length.toLocaleString()}</div>
        <div>|</div>
        <div><strong>Self-Referential Field:</strong> <code>parentId</code></div>
      </div>

      <TreeView
        dataSource={flatData}
        virtual
        height={400}
        itemHeight={30}
        expandOnClick
        selectable
        checkable
        defaultExpanded={defaultExpandedKeys}
      />
    </div>
  );
};

// 19. Self-Referential Data with Custom Field Mapping & Virtualization
export const SelfReferentialVirtualizedCustomMapping = () => {
  const { customFlatData, defaultExpandedKeys } = useMemo(() => {
    // API schema uses custom keys: `employeeId`, `managerId`, `name`, `title`
    const flat: Array<{ employeeId: string; managerId: string | null; name: string; title: string }> = [];
    const expanded: string[] = [];

    // 10 VPs (managerId: null)
    for (let i = 1; i <= 10; i++) {
      const vpId = `EMP-VP-${i}`;
      flat.push({
        employeeId: vpId,
        managerId: null,
        name: `VP Executive #${i}`,
        title: 'Vice President',
      });
      if (i <= 2) expanded.push(vpId);

      // 10 Directors per VP (100 directors)
      for (let j = 1; j <= 10; j++) {
        const dirId = `${vpId}-DIR-${j}`;
        flat.push({
          employeeId: dirId,
          managerId: vpId,
          name: `Director ${i}.${j}`,
          title: 'Director',
        });
        if (i === 1 && j <= 2) expanded.push(dirId);

        // 10 Managers per Director (1,000 managers)
        for (let k = 1; k <= 10; k++) {
          const mgrId = `${dirId}-MGR-${k}`;
          flat.push({
            employeeId: mgrId,
            managerId: dirId,
            name: `Manager ${i}.${j}.${k}`,
            title: 'Engineering Manager',
          });
          if (i === 1 && j === 1 && k <= 2) expanded.push(mgrId);

          // 50 Individual Contributors per Manager (50,000 ICs)
          for (let m = 1; m <= 50; m++) {
            flat.push({
              employeeId: `${mgrId}-IC-${m}`,
              managerId: mgrId,
              name: `Engineer ${i}.${j}.${k}.${m}`,
              title: 'Software Engineer',
            });
          }
        }
      }
    }

    return { customFlatData: flat, defaultExpandedKeys: expanded };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 540, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#0F172A' }}>🏢 50,000+ Org Chart (Mapped Self-Referential & Virtual)</h3>
        <span style={{ fontSize: 11, fontWeight: 700, background: '#E0E7FF', color: '#3730A3', padding: '2px 8px', borderRadius: 12 }}>
          fieldMapping + virtual
        </span>
      </div>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Combines <code>fieldMapping</code> (<code>employeeId</code> &rarr; <code>id</code>, <code>managerId</code> &rarr; <code>parentId</code>, <code>name</code> &rarr; <code>text</code>) with virtual windowing across 51,110 flat database records.
      </p>

      <TreeView
        dataSource={customFlatData}
        fieldMapping={{
          id: 'employeeId',
          parentId: 'managerId',
          text: 'name',
        }}
        virtual
        height={400}
        itemHeight={34}
        expandOnClick
        selectable
        defaultExpanded={defaultExpandedKeys}
        renderNode={(node) => {
          const item = node as unknown as { employeeId: string; title: string };
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', fontSize: 13 }}>
              <span>👤</span>
              <span style={{ fontWeight: 600, color: '#1E293B' }}>{node.text}</span>
              <span style={{ fontSize: 10, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4, marginLeft: 'auto' }}>
                {item.title || 'Staff'}
              </span>
            </div>
          );
        }}
      />
    </div>
  );
};

// 20. Interactive Self-Referential Virtualized Tree with Dynamic Mutations
export const SelfReferentialVirtualizedInteractive = () => {
  const [flatList, setFlatList] = useState<TreeNode[]>(() => {
    const list: TreeNode[] = [];
    // 20 Root categories
    for (let i = 1; i <= 20; i++) {
      const rootId = `node-r-${i}`;
      list.push({ id: rootId, parentId: null, text: `📁 Category #${i} (Self-Ref Root)` });
      // 50 Sub-items each
      for (let j = 1; j <= 50; j++) {
        list.push({ id: `${rootId}-sub-${j}`, parentId: rootId, text: `📄 Item #${i}-${j} (Parent: ${rootId})` });
      }
    }
    return list;
  });

  const [selectedId, setSelectedId] = useState<string | number | null>('node-r-1');
  const [newCount, setNewCount] = useState(1);

  const addNodeToSelected = () => {
    const targetParent = selectedId || 'node-r-1';
    const newId = `dynamic-node-${newCount}`;
    const newNode: TreeNode = {
      id: newId,
      parentId: targetParent,
      text: `✨ Dynamic Self-Ref Node #${newCount} (Parent ID: ${targetParent})`,
    };
    setFlatList(prev => [...prev, newNode]);
    setNewCount(prev => prev + 1);
  };

  const addRootNode = () => {
    const newId = `dynamic-root-${newCount}`;
    const newNode: TreeNode = {
      id: newId,
      parentId: null,
      text: `🌟 Dynamic Root Node #${newCount}`,
    };
    setFlatList(prev => [...prev, newNode]);
    setNewCount(prev => prev + 1);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 540, border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>⚡ Interactive Self-Referential Virtualized Tree</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Append new self-referential items directly to the 1D flat dataset. The component re-indexes references dynamically while maintaining smooth 60 FPS virtual windowing.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          onClick={addNodeToSelected}
          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
        >
          + Add Child Node to Selected ({selectedId || 'None'})
        </button>
        <button
          onClick={addRootNode}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
        >
          + Add New Self-Ref Root
        </button>
      </div>

      <div style={{ fontSize: 12, color: '#475569', marginBottom: 10, background: '#F1F5F9', padding: '6px 10px', borderRadius: 6 }}>
        Flat Dataset Length: <strong>{flatList.length} items</strong> | Selected Target Parent: <strong>{selectedId || 'None'}</strong>
      </div>

      <TreeView
        dataSource={flatList}
        virtual
        height={360}
        itemHeight={30}
        expandOnClick
        selectable
        checkable
        defaultExpanded={['node-r-1', 'node-r-2']}
        onNodeSelect={(node) => setSelectedId(node.id)}
      />
    </div>
  );
};

// 22. Custom Sub Slots Story (Exact User Pattern)
export const CustomSubSlots = () => {
  const [flatList] = useState<TreeNode[]>([
    { id: 'node-r-1', text: '📁 Enterprise System Architecture', parentId: null, hasChildren: true },
    { id: 'node-c-1', text: '⚡ Microservices Cluster', parentId: 'node-r-1', hasChildren: true },
    { id: 'node-c-2', text: '🔐 Authentication Gateway', parentId: 'node-c-1' },
    { id: 'node-c-3', text: '📦 Redis Cache Pool', parentId: 'node-c-1' },
    { id: 'node-r-2', text: '🌐 Cloud Infrastructure', parentId: null, hasChildren: true },
    { id: 'node-c-4', text: '🛡️ VPC & Firewall Rules', parentId: 'node-r-2' },
    { id: 'node-c-5', text: '📊 Monitoring Dashboard', parentId: 'node-r-2' },
  ]);
  const [selectedId, setSelectedId] = useState<string | number>('node-r-1');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 580, border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>🧩 TreeView Custom Sub-Slots</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Composed using <code>&lt;TreeviewItemContent&gt;</code> with <code>&lt;TreeItemToogle/&gt;</code>, <code>&lt;TreeItemLoadingSpinner/&gt;</code>, <code>&lt;TreeItemCkeck/&gt;</code>, <code>&lt;TreeItemicon/&gt;</code>, and <code>&lt;TreeItemText/&gt;</code>.
      </p>

      <div style={{ fontSize: 12, color: '#334155', marginBottom: 10, background: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
        Selected Node ID: <strong>{selectedId}</strong>
      </div>

      <TreeView
        dataSource={flatList}
        virtual
        height={360}
        itemHeight={34}
        expandOnClick
        selectable
        checkable
        defaultExpanded={['node-r-1', 'node-c-1']}
        onNodeSelect={(node) => setSelectedId(node.id)}
      >
        <TreeviewItemContent>
          {(ctx) => {
            return (
              <>
                <TreeItemToogle />
                <TreeItemLoadingSpinner />
                <TreeItemCkeck />
                <TreeItemicon />
                <TreeItemText />
              </>
            );
          }}
        </TreeviewItemContent>
      </TreeView>
    </div>
  );
};

// 22c. Individual Sub-Slot Children Customization Story (e.g. <TreeItemText>{ctx.node.text}</TreeItemText>)
export const IndividualSubSlotChildrenCustomization = () => {
  const [flatList] = useState<TreeNode[]>([
    { id: 'node-r-1', text: 'Financial Core Engine', parentId: null, hasChildren: true, data: { isNew: true, badge: 'PROD' } },
    { id: 'node-c-1', text: 'Transaction Ledger', parentId: 'node-r-1', hasChildren: true, data: { badge: 'V2' } },
    { id: 'node-c-2', text: 'Audit Logging Pipeline', parentId: 'node-c-1', data: { isNew: true } },
    { id: 'node-c-3', text: 'Payment Settlement API', parentId: 'node-c-1' },
    { id: 'node-r-2', text: 'Security Compliance', parentId: null, hasChildren: true, data: { badge: 'CRITICAL' } },
    { id: 'node-c-4', text: 'TLS Certificate Manager', parentId: 'node-r-2' },
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>✨ Individual Sub-Component Children Customization</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Pass custom text or elements directly inside <code>&lt;TreeItemText&gt;{'{ctx.node.text}'}&lt;/TreeItemText&gt;</code>!
      </p>

      <TreeView
        dataSource={flatList}
        virtual
        height={360}
        itemHeight={34}
        expandOnClick
        selectable
        checkable
        defaultExpanded={['node-r-1', 'node-c-1']}
      >
        <TreeviewItemContent>
          {(ctx) => {
            const data = (ctx.node.data as any) || {};

            return (
              <>
                <TreeItemToogle />
                <TreeItemLoadingSpinner />
                <TreeItemCkeck />
                
                {/* Custom Icon passed inside <TreeItemicon> */}
                <TreeItemicon>
                  {ctx.hasChildren ? (ctx.isExpanded ? '📂' : '📁') : '📜'}
                </TreeItemicon>

                {/* Custom Element Text passed directly inside <TreeItemText> */}
                <TreeItemText>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{ctx.node.text}</span>
                  {data.isNew && (
                    <span style={{ fontSize: 10, background: '#EFF6FF', color: '#2563EB', padding: '1px 5px', borderRadius: 4, fontWeight: 700, marginLeft: 6 }}>
                      NEW
                    </span>
                  )}
                  {data.badge && (
                    <span style={{ fontSize: 10, background: data.badge === 'CRITICAL' ? '#FEE2E2' : '#F1F5F9', color: data.badge === 'CRITICAL' ? '#991B1B' : '#475569', padding: '1px 5px', borderRadius: 4, fontWeight: 600, marginLeft: 6 }}>
                      {data.badge}
                    </span>
                  )}
                </TreeItemText>
              </>
            );
          }}
        </TreeviewItemContent>
      </TreeView>
    </div>
  );
};


// 22b. Custom Sub-Slots with Custom Elements, Badges & Actions Story
export const CustomSubSlotsWithCustomElementsAndText = () => {
  const [flatList] = useState<TreeNode[]>([
    { id: 'node-r-1', text: 'Enterprise System Architecture', data: { status: 'Healthy', version: 'v2.4.0', count: 12 }, parentId: null, hasChildren: true },
    { id: 'node-c-1', text: 'Microservices Cluster', data: { status: 'Active', version: 'v1.8.2', count: 5 }, parentId: 'node-r-1', hasChildren: true },
    { id: 'node-c-2', text: 'Authentication Gateway', data: { status: 'Protected', version: 'v3.1.0' }, parentId: 'node-c-1' },
    { id: 'node-c-3', text: 'Redis Cache Pool', data: { status: 'Active', version: 'v7.0.5' }, parentId: 'node-c-1' },
    { id: 'node-r-2', text: 'Cloud Infrastructure', data: { status: 'Warning', version: 'v1.0.0', count: 8 }, parentId: null, hasChildren: true },
    { id: 'node-c-4', text: 'VPC & Firewall Rules', data: { status: 'Configured', version: 'v2.0' }, parentId: 'node-r-2' },
    { id: 'node-c-5', text: 'Monitoring Dashboard', data: { status: 'Live', version: 'v4.5.1' }, parentId: 'node-r-2' },
  ]);
  const [selectedId, setSelectedId] = useState<string | number>('node-r-1');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>🎨 Custom Elements, Badges &amp; Actions in Sub-Slots</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Injected custom status pills, version badges, item counts, and interactive action buttons directly alongside sub-slot elements:
        <code>&lt;TreeItemToogle /&gt;</code>, <code>&lt;TreeItemLoadingSpinner /&gt;</code>, <code>&lt;TreeItemCkeck /&gt;</code>, <code>&lt;TreeItemicon /&gt;</code>, and <code>&lt;TreeItemText /&gt;</code>.
      </p>

      <div style={{ fontSize: 12, color: '#334155', marginBottom: 10, background: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
        Selected Item: <strong>{selectedId}</strong>
      </div>

      <TreeView
        dataSource={flatList}
        virtual
        height={380}
        itemHeight={38}
        expandOnClick
        selectable
        checkable
        defaultExpanded={['node-r-1', 'node-c-1']}
        onNodeSelect={(node) => setSelectedId(node.id)}
      >
        <TreeviewItemContent>
          {(ctx) => {
            const status = (ctx.node.data as any)?.status;
            const version = (ctx.node.data as any)?.version;
            const count = (ctx.node.data as any)?.count;

            return (
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
                <TreeItemToogle />
                <TreeItemLoadingSpinner />
                <TreeItemCkeck />
                <TreeItemicon />
                <TreeItemText />

                {/* Custom Elements & Badges inserted directly in slot */}
                {version && (
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748B', background: '#F1F5F9', padding: '1px 5px', borderRadius: 4 }}>
                    {version}
                  </span>
                )}

                {status && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 4,
                      marginLeft: 4,
                      background: status === 'Warning' ? '#FEF3C7' : status === 'Active' || status === 'Live' || status === 'Healthy' ? '#DCFCE7' : '#E0F2FE',
                      color: status === 'Warning' ? '#B45309' : status === 'Active' || status === 'Live' || status === 'Healthy' ? '#15803D' : '#0369A1',
                    }}
                  >
                    {status}
                  </span>
                )}

                {count != null && (
                  <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto', marginRight: 8 }}>
                    ({count} items)
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Executing quick action for: ${ctx.node.text}`);
                  }}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 4,
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#334155',
                    cursor: 'pointer',
                    marginLeft: count != null ? 0 : 'auto',
                  }}
                >
                  ⚡ Quick Action
                </button>
              </div>
            );
          }}
        </TreeviewItemContent>
      </TreeView>
    </div>
  );
};


// 23. Syncfusion DataManager Remote Data & Query Story
export const SyncfusionDataManagerRemote = () => {
  const dataManager = useMemo(() => {
    const rawData = [
      { id: 'rem-1', text: '🏢 Global Enterprise Corp', parentId: null, hasChildren: true },
      { id: 'rem-1-1', text: '💻 Engineering Division', parentId: 'rem-1', hasChildren: true },
      { id: 'rem-1-1-1', text: 'Frontend Core Team', parentId: 'rem-1-1' },
      { id: 'rem-1-1-2', text: 'Backend API Platform', parentId: 'rem-1-1' },
      { id: 'rem-1-2', text: '🎨 Product Design Team', parentId: 'rem-1' },
      { id: 'rem-2', text: '🚀 Operations & Sales', parentId: null, hasChildren: true },
      { id: 'rem-2-1', text: 'EMEA Regional Sales', parentId: 'rem-2' },
      { id: 'rem-2-2', text: 'APAC Enterprise Logistics', parentId: 'rem-2' },
    ];

    // Wrap in Syncfusion DataManager
    return new DataManager({
      json: rawData,
      adaptor: new JsonAdaptor(),
    });
  }, []);

  const query = useMemo(() => new Query(), []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 580, border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>📡 Syncfusion DataManager Remote Data</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Uses <code>@syncfusion/react-data</code> DataManager &amp; Query prop for remote data processing and <code>loadOnDemand</code> child fetching.
      </p>

      <TreeView
        dataSource={dataManager}
        query={query}
        loadOnDemand
        expandOnClick
        selectable
        checkable
        defaultExpanded={['rem-1']}
      />
    </div>
  );
};

// 24. Expand and Collapse Animation Story
export const ExpandCollapseAnimation = () => {
  const [data] = useState<TreeNode[]>([
    {
      id: 'anim-1',
      text: '✨ Smooth Animated Folder A',
      children: [
        { id: 'anim-1-1', text: '📄 Document 1.pdf' },
        { id: 'anim-1-2', text: '📊 Financial Summary.xlsx' },
        {
          id: 'anim-1-3',
          text: '📁 Nested Sub-folder',
          children: [
            { id: 'anim-1-3-1', text: '🖼️ Screenshot-2026.png' },
            { id: 'anim-1-3-2', text: '🎬 Presentation.mp4' },
          ],
        },
      ],
    },
    {
      id: 'anim-2',
      text: '🚀 Smooth Animated Folder B',
      children: [
        { id: 'anim-2-1', text: '⚙️ Settings.json' },
        { id: 'anim-2-2', text: '🔑 API-Key.pem' },
      ],
    },
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 580, border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>✨ Smooth Expand &amp; Collapse Animation</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Click any node to observe CSS grid height transitions and chevron rotation animations.
      </p>

      <TreeView
        dataSource={data}
        expandOnClick
        selectable
        checkable
        defaultExpanded={['anim-1']}
      />
    </div>
  );
};

// 25. CheckOnClick & SortOrder Story
export const CheckOnClickAndSorting = () => {
  const [data] = useState<TreeNode[]>([
    { id: '3', text: 'Zebra Node' },
    { id: '1', text: 'Apple Node' },
    { id: '4', text: 'Mango Node' },
    { id: '2', text: 'Banana Node' },
  ]);
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending' | 'None'>('Ascending');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 580, border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#FFFFFF' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#0F172A' }}>☑️ CheckOnClick &amp; SortOrder</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748B' }}>
        Clicking anywhere on a row toggles its check state (<code>checkOnClick</code>). Select sort order below.
      </p>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Sort Order:</span>
        <button
          onClick={() => setSortOrder('Ascending')}
          style={{ padding: '4px 8px', borderRadius: 4, background: sortOrder === 'Ascending' ? '#2563EB' : '#E2E8F0', color: sortOrder === 'Ascending' ? '#FFF' : '#000', border: 'none', cursor: 'pointer', fontSize: 12 }}
        >
          Ascending
        </button>
        <button
          onClick={() => setSortOrder('Descending')}
          style={{ padding: '4px 8px', borderRadius: 4, background: sortOrder === 'Descending' ? '#2563EB' : '#E2E8F0', color: sortOrder === 'Descending' ? '#FFF' : '#000', border: 'none', cursor: 'pointer', fontSize: 12 }}
        >
          Descending
        </button>
        <button
          onClick={() => setSortOrder('None')}
          style={{ padding: '4px 8px', borderRadius: 4, background: sortOrder === 'None' ? '#2563EB' : '#E2E8F0', color: sortOrder === 'None' ? '#FFF' : '#000', border: 'none', cursor: 'pointer', fontSize: 12 }}
        >
          None
        </button>
      </div>

      <TreeView
        dataSource={data}
        checkable
        checkOnClick
        sortOrder={sortOrder}
      />
    </div>
  );
};

