FROM public.ecr.aws/lambda/nodejs:12  

WORKDIR /app

RUN npm install 

COPY . ${LAMBDA_TASK_ROOT}/

CMD ["handler.handler"]