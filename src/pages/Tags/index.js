import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFinance } from '../../contexts/FinanceContext';
import Modal from '../../components/Modal';
import {
  PageContainer, PageTitle, Card, Button, Input,
  FormGroup, Label, EmptyState
} from '../../components/UI';

const PRESET_COLORS = [
  '#6C63FF', '#00B894', '#E74C3C', '#F39C12', '#3498DB',
  '#E84393', '#00CEC9', '#FDCB6E', '#A29BFE', '#2D3436',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#FF85A2', '#7C5CFC', '#2ECC71', '#1ABC9C', '#9B59B6',
];

const Tags = () => {
  const { tags, addTag, updateTag, deleteTag, transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6C63FF');

  const resetForm = () => {
    setName('');
    setColor('#6C63FF');
    setEditingTag(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Informe o nome da tag');

    if (editingTag) {
      updateTag(editingTag.id, { name: name.trim(), color });
      toast.success('Tag atualizada!');
    } else {
      addTag({ name: name.trim(), color });
      toast.success('Tag criada!');
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (tag) => {
    setName(tag.name);
    setColor(tag.color);
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const usageCount = transactions.filter(t => t.tags?.includes(id)).length;
    const msg = usageCount > 0
      ? `Esta tag está em ${usageCount} lançamento(s). Excluir mesmo assim?`
      : 'Excluir esta tag?';
    if (window.confirm(msg)) {
      deleteTag(id);
      toast.success('Tag excluída!');
    }
  };

  const getTagUsageCount = (tagId) =>
    transactions.filter(t => t.tags?.includes(tagId)).length;

  return (
    <PageContainer>
      <Header>
        <PageTitle>Tags / Categorias</PageTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Nova Tag
        </Button>
      </Header>

      {tags.length > 0 ? (
        <TagGrid>
          {tags.map(tag => {
            const count = getTagUsageCount(tag.id);
            return (
              <TagCard key={tag.id}>
                <TagColor $color={tag.color} />
                <TagInfo>
                  <TagName>{tag.name}</TagName>
                  <TagCount>{count} lançamento{count !== 1 ? 's' : ''}</TagCount>
                </TagInfo>
                <TagActions>
                  <ActionBtn onClick={() => handleEdit(tag)}><FaEdit /></ActionBtn>
                  <ActionBtn $danger onClick={() => handleDelete(tag.id)}><FaTrash /></ActionBtn>
                </TagActions>
              </TagCard>
            );
          })}
        </TagGrid>
      ) : (
        <Card>
          <EmptyState>
            <FaTags />
            <p>Nenhuma tag criada</p>
            <Button $size="sm" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
              <FaPlus /> Criar Tag
            </Button>
          </EmptyState>
        </Card>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingTag ? 'Editar Tag' : 'Nova Tag'}
      >
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome *</Label>
            <Input value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Alimentação, Transporte..." />
          </FormGroup>

          <FormGroup>
            <Label>Cor</Label>
            <ColorGrid>
              {PRESET_COLORS.map(c => (
                <ColorOption key={c} $color={c} $active={color === c}
                  type="button" onClick={() => setColor(c)} />
              ))}
            </ColorGrid>
            <ColorCustom>
              <Label>Personalizada:</Label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} />
            </ColorCustom>
          </FormGroup>

          <Preview>
            <PreviewLabel>Prévia:</PreviewLabel>
            <PreviewBadge $color={color}>{name || 'Nome da tag'}</PreviewBadge>
          </Preview>

          <FormActions>
            <Button type="button" $variant="ghost"
              onClick={() => { setShowForm(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit">{editingTag ? 'Atualizar' : 'Criar'}</Button>
          </FormActions>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Tags;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const TagGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;
`;
const TagCard = styled.div`
  display: flex; align-items: center; gap: 14px;
  background: white; padding: 16px 18px;
  border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
`;
const TagColor = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: ${({ $color }) => $color}; flex-shrink: 0;
`;
const TagInfo = styled.div`
  flex: 1; min-width: 0;
`;
const TagName = styled.p`
  font-size: 15px; font-weight: 600; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
`;
const TagCount = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};
`;
const TagActions = styled.div`
  display: flex; gap: 6px;
`;
const ActionBtn = styled.button`
  padding: 8px; border-radius: 8px; border: none;
  background: ${({ $danger }) => $danger ? '#FDECEC' : '#F0F2F8'};
  color: ${({ $danger }) => $danger ? '#E74C3C' : '#636E72'};
  font-size: 13px; display: flex; align-items: center;
  &:hover { opacity: 0.8; }
`;
const ColorGrid = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
`;
const ColorOption = styled.button`
  width: 32px; height: 32px; border-radius: 8px;
  background: ${({ $color }) => $color};
  border: 3px solid ${({ $active, $color }) => $active ? '#2D3436' : 'transparent'};
  cursor: pointer; transition: all 0.2s;
  &:hover { transform: scale(1.1); }
`;
const ColorCustom = styled.div`
  display: flex; align-items: center; gap: 8px; margin-top: 10px;
  input[type="color"] {
    width: 36px; height: 36px; border: none; cursor: pointer;
    border-radius: 6px; padding: 0;
  }
`;
const Preview = styled.div`
  display: flex; align-items: center; gap: 10px; margin: 16px 0 8px;
  padding: 12px; background: #F5F6FA; border-radius: 8px;
`;
const PreviewLabel = styled.span`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
`;
const PreviewBadge = styled.span`
  display: inline-flex; padding: 4px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 600;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`;
const FormActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;
`;
