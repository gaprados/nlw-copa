import { useCallback, useState } from "react";
import { VStack, Icon, FlatList } from "native-base";
import { Octicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { api } from "../lib/api";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { PollCard, PollProps } from "../components/PollCard";
import { EmptyPollList } from "../components/EmptyPollList";

export function Polls() {
  const [isLoading, setIsLoading] = useState(true);
  const [polls, setPolls] = useState<PollProps[]>([]);

  const { navigate } = useNavigation();

  async function fetchPolls() {
    try {
      const response = await api.get('/polls');

      setPolls(response.data.polls);
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchPolls();
  }, []));

  return (
    <VStack flex={1} bgColor='gray.900'>
      <Header title="Meus bolões" />
      <VStack mt={6} mx={5} borderBottomWidth={1} borderBottomColor="gray.600" pb={4} mb={4}>
        <Button
          title="Buscar bolão por código"
          leftIcon={<Icon as={Octicons} name='search' color="black" size="md" />}
          onPress={() => navigate('Find')}
        />
      </VStack>

      {isLoading ? <Loading /> : (
        <FlatList
          data={polls}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PollCard
              data={item}
              onPress={() => navigate('Details', { id: item.id })}
            />
          )}
          px={5}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ pb: 10 }}
          ListEmptyComponent={() => <EmptyPollList />}
        />
      )}
    </VStack>
  )
}