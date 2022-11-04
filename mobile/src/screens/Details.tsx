import { useRoute } from "@react-navigation/native";
import { Share } from 'react-native'
import { HStack, VStack } from "native-base";
import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PollHeader } from "../components/PollHeader";
import { EmptyMyPollList } from "../components/EmptyMyPollList";
import { Option } from "../components/Option";
import { Guesses } from "../components/Guesses";
import type { PollProps } from "../components/PollCard";

interface RouteParams {
  id: string;
}


export function Details() {
  const [selectedOption, setSelectedOption] = useState<'guesses' | 'ranking'>('guesses')
  const [isLoading, setIsLoading] = useState(true);
  const [pollDetails, setPollDetails] = useState<PollProps>({} as PollProps);
  const { params } = useRoute();
  const { id } = params as RouteParams;

  async function fetchPollDetails() {
    try {

      const response = await api.get(`/polls/${id}`);
      console.log(response.data.poll)
      setPollDetails(response.data.poll);
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false);
    }
  };

  async function handleCodeShare() {
    await Share.share({
      message: `Participe agora do meu bolão! Entre no app e digite o código: ${pollDetails.code}`,
    })
  };

  useEffect(() => {
    fetchPollDetails();
  }, [id]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={pollDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />


      {pollDetails._count.participants > 0 ? (
        <VStack px={5} flex={1}>
          <PollHeader data={pollDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              title="Seus palpites"
              onPress={() => setSelectedOption('guesses')}
              isSelected={selectedOption === 'guesses'}
            />
            <Option
              onPress={() => setSelectedOption('ranking')}
              title="Ranking do grupo"
              isSelected={selectedOption === 'ranking'}
            />
          </HStack>
          <Guesses pollId={pollDetails.id} codeId={pollDetails.code} />
        </VStack>
      ) : (
        <EmptyMyPollList code={pollDetails.code} />
      )}
    </VStack>
  )
}