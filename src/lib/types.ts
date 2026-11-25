export type PublicQuestion = {
  id: string;
  text: string;
  order: number;
  options: {
    id: string;
    label: string;
    value: string;
    order: number;
  }[];
};

export type QuizAnswerPayload = {
  questionId: string;
  questionText: string;
  optionId: string;
  optionLabel: string;
  optionValue: string;
};
