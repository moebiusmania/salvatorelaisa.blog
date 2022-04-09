import Coffee from '@/components/Coffee'

const Tip = (props) => {
  const isLargeScreen = props.isLargeScreen || false
  const mq = isLargeScreen ? 'hidden xl:block' : 'xl:hidden'

  return (
    <section className={`${mq} !border-t-0`}>
      <p className="mb-4 italic text-sm">
        Se ti piace questo blog e ti va di supportarmi, o anche solo se se ti sto un pò simpatico,
        puoi offrirmi un caffé! E' un piccolo gesto ma che apprezzerei molto{' '}
        <span className="not-italic">🙂</span>.
      </p>
      <div className="md:w-max mx-auto">
        <Coffee />
      </div>
    </section>
  )
}

export default Tip
