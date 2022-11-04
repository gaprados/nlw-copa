import { Heading, Text, useToast, VStack } from "native-base";
import { Header } from "../components/Header";

import Logo from '../assets/logo.svg'
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useState } from "react";
import { Alert } from "react-native";
import { api } from "../lib/api";

export function New() {
  const [pollTitle, setPollTitle] = useState('');
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const toast = useToast()

  async function handlePollCreate() {
    if (!pollTitle.trim()) {
      return toast.show({
        title: "Opa! Informe um nome para seu bolão.",
        placement: "top",
        bgColor: "red.500",
        duration: 3000,
      })
    };

    try {
      setIsCreatingPoll(true);

      await api.post('/polls', {
        title: pollTitle,
      });

      toast.show({
        title: "Bolão criado com sucesso!",
        placement: "top",
        bgColor: "green.500",
        duration: 3000,
      });

      setPollTitle('');
    } catch (err) {
      console.log(err)
      throw err;
    } finally {
      setIsCreatingPoll(false);
    }

  }

  return (
    <VStack flex={1} bgColor="gray.900" >
      <Header title='Criar novo bolão' />

      <VStack mt={8} mx={5} alignItems='center'>
        <Logo />

        <Heading fontFamily="heading" color="white" fontSize="xl" my={8} textAlign="center">
          Crie seu próprio bolão da copa {'\n'}
          e compartilhe entre amigos!
        </Heading>

        <Input
          mb={2}
          placeholder="Qual nome do seu bolão?"
          value={pollTitle}
          onChangeText={value => setPollTitle(value)}
        />
        <Button
          title="Criar meu bolão"
          onPress={handlePollCreate}
          isLoading={isCreatingPoll}
        />

        <Text color="gray.200" fontSize="sm" textAlign="center" px={10} mt={4}>
          Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas.
        </Text>
      </VStack>
    </VStack>
  )
}