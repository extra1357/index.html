class LLMRouter:
    def __init__(self, small_model, big_model):
        self.small = small_model
        self.big = big_model

    def route(self, prompt):
        if len(prompt) < 200:
            return self.small.generate(prompt)
        return self.big.generate(prompt)
