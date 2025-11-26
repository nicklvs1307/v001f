import React, { useState, useEffect, useContext } from 'react';
import { Typography, Box, Paper, Grid } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PageLayout from '../../components/layout/PageLayout';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';

const initialColumns = {
    'pendente': {
        name: 'Pendente',
        items: [],
    },
    'em-andamento': {
        name: 'Em Andamento',
        items: [],
    },
    'concluido': {
        name: 'Concluído',
        items: [],
    },
};

const TratativasPage = () => {
    const { user } = useContext(AuthContext);
    const [columns, setColumns] = useState(initialColumns);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            if (!user?.tenantId) return;

            try {
                setLoading(true);
                const params = { tenantId: user.tenantId, limit: 100 }; // Fetch more for kanban
                const data = await dashboardService.getAllFeedbacks(params);

                // Assuming feedbacks don't have a status, start them all in 'pendente'
                const pendingItems = data.rows.map((fb, index) => ({ ...fb, dndId: fb.id.toString() }));

                setColumns(prev => ({
                    ...prev,
                    'pendente': { ...prev['pendente'], items: pendingItems }
                }));

            } catch (error) {
                console.error("Failed to fetch feedbacks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [user]);

    const onDragEnd = (result, columns, setColumns) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems,
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems,
                },
            });
            // Here you would typically make an API call to update the status
            // e.g., feedbackService.updateStatus(removed.id, destination.droppableId);
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems,
                },
            });
        }
    };


    return (
        <PageLayout title="Tratativas" showDateFilters={false}>
            {loading ? <Typography>Carregando...</Typography> : (
                <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
                    <Grid container spacing={3}>
                        {Object.entries(columns).map(([columnId, column]) => (
                            <Grid item xs={12} md={4} key={columnId}>
                                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                    <Typography variant="h6">{column.name}</Typography>
                                    <Droppable droppableId={columnId}>
                                        {(provided, snapshot) => (
                                            <Box
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                sx={{
                                                    background: snapshot.isDraggingOver ? 'lightblue' : '#f5f5f5',
                                                    padding: '16px',
                                                    minHeight: '500px',
                                                }}
                                            >
                                                {column.items.map((item, index) => (
                                                    <Draggable key={item.dndId} draggableId={item.dndId} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Paper
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                sx={{
                                                                    padding: '16px',
                                                                    marginBottom: '8px',
                                                                    backgroundColor: snapshot.isDragging ? '#e0e0e0' : 'white',
                                                                    ...provided.draggableProps.style,
                                                                }}
                                                            >
                                                                <Typography variant="subtitle1">{item.client?.name || 'Cliente anônimo'}</Typography>
                                                                <Typography variant="body2">{item.comment}</Typography>
                                                            </Paper>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </Box>
                                        )}
                                    </Droppable>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </DragDropContext>
            )}
        </PageLayout>
    );
};

export default TratativasPage;