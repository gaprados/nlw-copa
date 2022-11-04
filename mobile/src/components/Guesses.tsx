import { useEffect, useState } from 'react';
import { FlatList, useToast } from 'native-base';

import { api } from '../lib/api';
import { Game, GameProps } from './Game'
import { Loading } from './Loading';
import { EmptyMyPollList } from './EmptyMyPollList';

interface Props {
  pollId: string;
  codeId: string;
}

export function Guesses({ pollId, codeId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<GameProps[]>([]);
  const [firstTeamPoints, setFirstTeamPoints] = useState('0');
  const [secondTeamPoints, setSecondTeamPoints] = useState('0');

  const toast = useToast();

  async function fetchGames() {
    try {
      const response = await api.get(`/polls/${pollId}/games`);
      setGames(response.data.games)
    } catch (err) {
      console.log(err)
    }
    finally {
      setIsLoading(false);
    }
  }

  async function handleGuessConfirm(gameId: string) {
    try {
      setIsLoading(true);
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite',
          placement: 'top',
          bgColor: 'red.500',
        })
      }

      await api.post(`/polls/${pollId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });

      toast.show({
        title: 'Paplite enviado com sucesso',
        placement: 'top',
        bgColor: 'green.500',
      });

      fetchGames();
    } catch (err) {
      console.log(err);
      toast.show({
        title: 'Não foi possível enviar o palpite.',
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, [pollId])

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FlatList
      data={games}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      _contentContainerStyle={{ pb: 10 }}
      ListEmptyComponent={() => <EmptyMyPollList code={codeId} />}
    />
  );
}
