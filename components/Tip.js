import Coffee from '@/components/Coffee'

const Tip = () => (
  <section>
    <p className="mb-4 italic text-sm">
      Se ti piace questo blog e ti va di supportarmi, o anche solo se se ti sto un pò simpatico,
      puoi offrirmi un caffé! E' un piccolo gesto ma che apprezzerei davvero molto{' '}
      <span className="not-italic">🙂</span>.
    </p>
    <div className="md:w-64 mx-auto">
      <Coffee />
    </div>
  </section>
)

export default Tip
